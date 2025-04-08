import React, { useEffect, useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import './App.css';

const App = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [categorizedMenu, setCategorizedMenu] = useState({});
  const [activeCategory, setActiveCategory] = useState(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [cart, setCart] = useState([]);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [userDetails, setUserDetails] = useState({ name: "", contact: "", date: "", time: "" });

  useEffect(() => {
    fetchMenu();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const fetchMenu = async () => {
    try {
      const response = await axios.get("http://localhost:2025/menucard");
      const sortedMenu = response.data.menu.sort((a, b) => a.food_category.localeCompare(b.food_category));
      const categorized = {};
      sortedMenu.forEach((item) => {
        if (!categorized[item.food_category]) {
          categorized[item.food_category] = [];
        }
        categorized[item.food_category].push(item);
      });
      setCategorizedMenu(categorized);
    } catch (error) {
      toast.error("Failed to fetch menu!");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => setSearchQuery(e.target.value.toLowerCase());
  const handleScroll = () => setShowScrollTop(window.scrollY > 300);
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  const addToCart = (item) => {
    const exists = cart.find((i) => i.menu_name === item.menu_name);
    if (exists) {
      const updated = cart.map((i) =>
        i.menu_name === item.menu_name ? { ...i, quantity: i.quantity + 1 } : i
      );
      setCart(updated);
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
    toast.success(`${item.menu_name} added to cart`);
  };

  const updateQuantity = (item, delta) => {
    const updated = cart
      .map((i) =>
        i.menu_name === item.menu_name ? { ...i, quantity: i.quantity + delta } : i
      )
      .filter((i) => i.quantity > 0);
    setCart(updated);
  };

  const getCartQuantity = (itemName) => {
    const item = cart.find((i) => i.menu_name === itemName);
    return item ? item.quantity : 0;
  };

  const handleOrder = async () => {
    if (!userDetails.name || !userDetails.contact || !userDetails.date || !userDetails.time) {
      toast.error("Please fill all details");
      return;
    }

    try {
      const payload = {
        name: userDetails.name,
        contact: userDetails.contact,
        date: userDetails.date,
        time: userDetails.time,
        cart: cart.map(item => ({
          mid: item.mid,
          menu_name: item.menu_name,
          quantity: item.quantity,
          menu_price: item.menu_price
        }))
      };

      const response = await axios.post("http://localhost:2025/placeorder", payload);
      if (response.status === 200) {
        toast.success("Order placed successfully!");
        setCart([]);
        setUserDetails({ name: "", contact: "", date: "", time: "" });
        setShowOrderForm(false);
      } else {
        toast.error("Failed to place order!");
      }
    } catch (error) {
      console.error("Place order error:", error);
      toast.error("Error placing order");
    }
  };

  const totalAmount = cart.reduce((sum, item) => sum + item.menu_price * item.quantity, 0);

  return (
    <div className="app-container">
      <ToastContainer />
      <header className="header">
        <h1>Delicious Bites</h1>
        <p>Savor the Flavor, Enjoy the Moment</p>
      </header>

      <div className="view-cart-bubble" onClick={() => setShowOrderForm(!showOrderForm)}>
        🛒 View Cart ({cart.length})
      </div>

      <section className="category-section">
        {Object.keys(categorizedMenu).map((category, index) => (
          <button
            key={index}
            className={`category-button ${activeCategory === category ? "active" : ""}`}
            onClick={() => setActiveCategory(activeCategory === category ? null : category)}
          >
            {category}
          </button>
        ))}
      </section>

      {activeCategory && (
        <>
          <div className="search-box">
            <input
              type="text"
              placeholder="Search Menu..."
              value={searchQuery}
              onChange={handleSearch}
            />
          </div>

          {loading ? (
            <p className="text-center fw-bold text-primary">Loading Menu...</p>
          ) : (
            <div className="menu-grid">
              {categorizedMenu[activeCategory]
                .filter((item) => item.menu_name.toLowerCase().includes(searchQuery))
                .map((item, idx) => {
                  const qty = getCartQuantity(item.menu_name);
                  return (
                    <div key={idx} className="menu-card">
                      <h5>{item.menu_name}</h5>
                      <p>₹{item.menu_price}</p>
                      <div className="qty-buttons">
                        <button onClick={() => updateQuantity(item, -1)}>-</button>
                        <button onClick={() => addToCart(item)} className="add-cart-btn">Add to Cart</button>
                        <button onClick={() => addToCart(item)}>+</button>
                      </div>
                      {qty > 0 && <p className="cart-qty-display">Qty in Cart: {qty}</p>}
                    </div>
                  );
                })}
            </div>
          )}
        </>
      )}

      {showOrderForm && (
        <div className="cart-popup">
          <h4>Your Cart</h4>
          {cart.length === 0 ? (
            <p>No items in cart</p>
          ) : (
            <>
              <ul className="cart-list">
                {cart.map((item, idx) => (
                  <li key={idx}>
                    <div>
                      <strong>{item.menu_name}</strong> (₹{item.menu_price}) × {item.quantity}
                    </div>
                    <div>
                      <button onClick={() => updateQuantity(item, -1)}>-</button>
                      <button onClick={() => updateQuantity(item, 1)}>+</button>
                    </div>
                  </li>
                ))}
              </ul>
              <p className="total">Total: ₹{totalAmount}</p>
              <div className="order-form">
                <input type="text" placeholder="Your Name" value={userDetails.name} onChange={(e) => setUserDetails({ ...userDetails, name: e.target.value })} />
                <input type="number" placeholder="Contact Number" value={userDetails.contact} onChange={(e) => setUserDetails({ ...userDetails, contact: e.target.value })} />
                <input type="date" value={userDetails.date} onChange={(e) => setUserDetails({ ...userDetails, date: e.target.value })} />
                <input type="time" value={userDetails.time} onChange={(e) => setUserDetails({ ...userDetails, time: e.target.value })} />
                <button onClick={handleOrder} className="btn btn-success">Place Order</button>
              </div>
            </>
          )}
        </div>
      )}

      <footer className="footer">
        <p>&copy; 2024 Delicious Bites | All Rights Reserved</p>
      </footer>

      {showScrollTop && (
        <button onClick={scrollToTop} className="scroll-to-top">↑</button>
      )}
    </div>
  );
};

export default App;