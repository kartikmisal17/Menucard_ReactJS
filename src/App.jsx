<<<<<<< HEAD
import React, { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";
=======
// App.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import './App.css';
>>>>>>> 5b50fd1 (Updated files)

const App = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [categorizedMenu, setCategorizedMenu] = useState({});
  const [activeCategory, setActiveCategory] = useState(null);
<<<<<<< HEAD

  useEffect(() => {
    fetchMenu();
=======
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [cart, setCart] = useState([]);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [userDetails, setUserDetails] = useState({ name: "", contact: "", date: "", time: "" });

  useEffect(() => {
    fetchMenu();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
>>>>>>> 5b50fd1 (Updated files)
  }, []);

  const fetchMenu = async () => {
    try {
<<<<<<< HEAD
      const response = await axios.get("http://localhost:2025/menucard");
      const sortedMenu = response.data.menu.sort((a, b) =>
        a.food_category.localeCompare(b.food_category)
      );
      
=======
      const response = await axios.get("http://192.168.104.169:2025/menucard");
      const sortedMenu = response.data.menu.sort((a, b) => a.food_category.localeCompare(b.food_category));
>>>>>>> 5b50fd1 (Updated files)
      const categorized = {};
      sortedMenu.forEach((item) => {
        if (!categorized[item.food_category]) {
          categorized[item.food_category] = [];
        }
        categorized[item.food_category].push(item);
      });
<<<<<<< HEAD

      setCategorizedMenu(categorized);
    } catch (error) {
      console.error("Error fetching menu:", error);
=======
      setCategorizedMenu(categorized);
    } catch (error) {
      toast.error("Failed to fetch menu!");
>>>>>>> 5b50fd1 (Updated files)
    } finally {
      setLoading(false);
    }
  };

<<<<<<< HEAD
  const handleSearch = (e) => {
    setSearchQuery(e.target.value.toLowerCase());
  };

  return (
    <div>
      <header className="text-center py-4">
        <h1 className="fw-bold display-3">Delicious Bites</h1>
        <p className="lead">Savor the Flavor, Enjoy the Moment</p>
      </header>

      <section className="container py-5">
        <div className="category-buttons text-center mb-4" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          {Object.keys(categorizedMenu).map((category, index) => (
            <button
              key={index}
              className={`card shadow-lg menu-card mb-2 ${activeCategory === category ? "active" : ""}`}
              onClick={() => setActiveCategory(activeCategory === category ? null : category)}
            >
              {category}
            </button>
          ))}
        </div>

        {activeCategory && (
          <div>
            <div className="search-box mb-4">
              <input
                type="text"
                className="form-control search-input"
                placeholder="Search Menu..."
                value={searchQuery}
                onChange={handleSearch}
              />
            </div>
            
            {loading ? (
              <p className="text-center fw-bold text-primary">Loading Menu...</p>
            ) : categorizedMenu[activeCategory] ? (
              <div className="category-section mb-5">
                <center><h2 className="category-title text-center">{activeCategory}</h2></center>
                
                <div className="row">
                  {categorizedMenu[activeCategory]
                    .filter((item) =>
                      item.menu_name.toLowerCase().includes(searchQuery)
                    )
                    .map((item, idx) => (
                      <div key={idx} className="col-lg-4 col-md-6 mb-4">
                        <div className="card shadow-lg menu-card">
                          <div className="card-body">
                            <h5 className="card-title">{item.menu_name}</h5>
                            <p>
                              <strong>Quantity:</strong> {item.quantity}
                            </p>
                            <p className="fw-bold text-danger">₹{item.menu_price}</p>
                            <button className="btn order-btn">Order Now</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  {categorizedMenu[activeCategory].filter((item) => item.menu_name.toLowerCase().includes(searchQuery)).length === 0 && (
                    <h3 className="text-center text-danger fw-bold">Opps..!! Menu item not found</h3>
                    
                  )}
                </div>
              </div>
            ) : (
              <p className="text-center text-danger fw-bold">Menu Unavailable</p>
            )}
          </div>
        )}
      </section>

      <footer className="text-center py-3">
        <p>&copy; 2024 Delicious Bites | All Rights Reserved</p>
      </footer>
=======
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

      const response = await axios.post("http://192.168.104.169:2025/placeorder", payload);
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
                      {qty > 0 && (
                        <p className="cart-qty-display">Qty in Cart: {qty}</p>
                      )}
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
>>>>>>> 5b50fd1 (Updated files)
    </div>
  );
};

export default App;
