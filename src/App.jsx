import React, { useEffect, useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";
import { motion } from "framer-motion";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const App = () => {
  // State definitions
  const [menuItems, setMenuItems] = useState([]); // All menu items
  const [searchQuery, setSearchQuery] = useState(""); // Search input
  const [loading, setLoading] = useState(true); // Loader status
  const [categorizedMenu, setCategorizedMenu] = useState({}); // Menu sorted by category
  const [activeCategory, setActiveCategory] = useState(null); // Selected category
  const [showScrollTop, setShowScrollTop] = useState(false); // Show scroll-to-top
  const [cart, setCart] = useState([]); // Current cart
  const [receiptCart, setReceiptCart] = useState([]); // Final cart for receipt
  const [showOrderForm, setShowOrderForm] = useState(false); // Show/hide cart popup
  const [orderId, setOrderId] = useState(null); // Generated order ID

  // User details for placing order
  const [userDetails, setUserDetails] = useState({
    name: "",
    contact: "",
    date: "",
    time: "",
  });

  // On mount, fetch menu and attach scroll listener
  useEffect(() => {
    fetchMenu();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fetch menu items from backend and categorize
  const fetchMenu = async () => {
    try {
      const response = await axios.get("http://192.168.58.169:2025/menucard");
      const sortedMenu = response.data.menu.sort((a, b) =>
        a.food_category.localeCompare(b.food_category)
      );
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

  // Show scroll button if user scrolls down
  const handleScroll = () => {
    setShowScrollTop(window.scrollY > 300);
  };

  // Scroll to top of page
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Capture user search input
  const handleSearch = (e) => {
    setSearchQuery(e.target.value.toLowerCase());
  };

  // Add item to cart or update quantity
  const addToCart = (item) => {
    const quantityType = item.quantity || "N/A";
    const exists = cart.find(
      (i) => i.menu_name === item.menu_name && i.quantityType === quantityType
    );
    if (exists) {
      const updated = cart.map((i) =>
        i.menu_name === item.menu_name && i.quantityType === quantityType
          ? { ...i, quantity: i.quantity + 1 }
          : i
      );
      setCart(updated);
    } else {
      setCart([
        ...cart,
        {
          ...item,
          quantity: 1,
          quantityType,
        },
      ]);
    }
    toast.success(`${item.menu_name} (${quantityType}) added to cart`);
  };

  // Increase or decrease quantity in cart
  const updateQuantity = (item, delta) => {
    const updated = cart
      .map((i) =>
        i.menu_name === item.menu_name && i.quantityType === item.quantityType
          ? { ...i, quantity: i.quantity + delta }
          : i
      )
      .filter((i) => i.quantity > 0);
    setCart(updated);
  };

  // Get quantity of specific item in cart
  const getCartQuantity = (itemName, quantityType) => {
    const item = cart.find(
      (i) => i.menu_name === itemName && i.quantityType === quantityType
    );
    return item ? item.quantity : 0;
  };

  // Generate and download receipt PDF
  const generatePDF = async (receiptId) => {
    const input = document.getElementById("receipt");
    const canvas = await html2canvas(input);
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`Order_Receipt_${receiptId}.pdf`);
  };

  // Place order and call API
  const handleOrder = async () => {
    const { name, contact, date, time } = userDetails;
    if (!name || !contact || !date || !time) {
      toast.error("Please fill all details");
      return;
    }
     // ✅ 10 digits ka validation
  if (contact.length !== 10) {
    toast.error("Contact number must be exactly 10 digits");
    return;
  }

    try {
      const receiptId = `ORD-${Date.now()}`;
      setOrderId(receiptId);
      setReceiptCart(cart);

      const payload = {
        name,
        contact,
        date,
        time,
        orderId: receiptId,
        cart: cart.map((item) => ({
          mid: item.mid,
          menu_name: item.menu_name,
          quantity: item.quantity,
          menu_price: item.menu_price,
          quantity_type: item.quantityType,
        })),
      };

      const response = await axios.post("http://192.168.58.169:2025/placeorder", payload);
      if (response.status === 200) {
        toast.success("Order placed successfully!");
        await generatePDF(receiptId);
        setCart([]);
        setUserDetails({ name: "", contact: "", date: "", time: "" });
        setShowOrderForm(false);
      } else {
        toast.error("Failed to place order!");
      }
    } catch (error) {
      console.error("Order error:", error);
      toast.error("Error placing order");
    }
  };

  // Calculate totals
  const totalAmount = cart.reduce(
    (sum, item) => sum + item.menu_price * item.quantity,
    0
  );
  const receiptTotal = receiptCart.reduce(
    (sum, item) => sum + item.menu_price * item.quantity,
    0
  );

  // UI rendering starts here
  return (
    <div>
    <ToastContainer position="top-left" autoClose={3000} />


      {/* Header */}
      <header className="header">
        <h1>Delicious Bites</h1>
        <p>Savor the Flavor, Enjoy the Moment</p>
      </header>

      {/* Cart button bubble */}
      <div className="view-cart-bubble" onClick={() => setShowOrderForm(!showOrderForm)}>
        🛒 Cart <span className="cart-count">{cart.length}</span>
      </div>

      {/* Category buttons */}
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

      {/* Menu Items Grid */}
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
            <p className="text-center">Loading Menu...</p>
          ) : (
            <div className="menu-grid">
              {categorizedMenu[activeCategory]
                .filter((item) => item.menu_name.toLowerCase().includes(searchQuery))
                .map((item, idx) => {
                  const qty = getCartQuantity(item.menu_name, item.quantity || "N/A");
                  return (
                    <motion.div
                      key={idx}
                      className="menu-card"
                      whileHover={{ scale: 1.03 }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4 }}
                    >
                      {item.image && <img src={item.image} alt={item.menu_name} className="menu-image" />}
                      <h5>{item.menu_name}</h5>
                      <p>₹{item.menu_price}</p>
                      <p><strong>Quantity:</strong> {item.quantity}</p>
                      <div className="qty-buttons">
                        <button onClick={() => updateQuantity(
                          { menu_name: item.menu_name, quantityType: item.quantity || "N/A" }, -1
                        )}>-</button>
                        <button onClick={() => addToCart(item)} className="add-cart-btn">Add to Cart</button>
                        <button onClick={() => addToCart(item)}>+</button>
                      </div>
                      {qty > 0 && <p className="cart-qty-display">Qty in Cart: {qty}</p>}
                    </motion.div>
                  );
                })}
            </div>
          )}
        </>
      )}

      {/* Cart Popup for placing order */}
      {showOrderForm && (
        <motion.div className="cart-popup" initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }}>
          <h4>Your Cart</h4>

          {cart.length === 0 ? (
            <p>No items in cart</p>
          ) : (
            <>
              {/* List cart items */}
              <ul className="cart-list">
                {cart.map((item, idx) => (
                  <li key={idx}>
                    <div>
                      <strong>{item.menu_name}</strong> ({item.quantityType || "N/A"}) — ₹{item.menu_price} × {item.quantity}
                    </div>
                    <div>
                      <button onClick={() => updateQuantity(item, -1)}>-</button>
                      <button onClick={() => updateQuantity(item, 1)}>+</button>
                    </div>
                  </li>
                ))}
              </ul>

              {/* Total price */}
              <p className="total">Total: ₹{totalAmount}</p>

              {/* Order form inputs */}
              <div className="order-form">
                <input type="text" placeholder="Your Name" value={userDetails.name} onChange={(e) => setUserDetails({ ...userDetails, name: e.target.value })} />
                <input type="number" placeholder="Contact Number" value={userDetails.contact} onChange={(e) => setUserDetails({ ...userDetails, contact: e.target.value })} />
                <input type="date" value={userDetails.date} onChange={(e) => setUserDetails({ ...userDetails, date: e.target.value })} />
                <input type="time" value={userDetails.time} onChange={(e) => setUserDetails({ ...userDetails, time: e.target.value })} />
                <button onClick={handleOrder} className="btn btn-success">Place Order</button>
              </div>

              {/* Receipt Display */}
              {receiptCart.length > 0 && (
                <div id="receipt" style={{ padding: "1rem", backgroundColor: "#fff", marginTop: "1rem", border: "1px solid #ccc" }}>
                  <h2 style={{ textAlign: "center" }}>
                    <h1>Delicious Bites</h1>Order Receipt
                  </h2>
                  <p><strong>Order ID:</strong> {orderId}</p>
                  <p><strong>Name:</strong> {userDetails.name}</p>
                  <p><strong>Contact:</strong> {userDetails.contact}</p>
                  <p><strong>Date:</strong> {userDetails.date}</p>
                  <p><strong>Time:</strong> {userDetails.time}</p>
                  <hr />
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr>
                        <th style={{ border: "1px solid #ccc" }}>Item</th>
                        <th style={{ border: "1px solid #ccc" }}>Type</th>
                        <th style={{ border: "1px solid #ccc" }}>Qty</th>
                        <th style={{ border: "1px solid #ccc" }}>Price</th>
                        <th style={{ border: "1px solid #ccc" }}>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {receiptCart.map((item, idx) => (
                        <tr key={idx}>
                          <td style={{ border: "1px solid #ccc" }}>{item.menu_name}</td>
                          <td style={{ border: "1px solid #ccc" }}>{item.quantityType}</td>
                          <td style={{ border: "1px solid #ccc" }}>{item.quantity}</td>
                          <td style={{ border: "1px solid #ccc" }}>₹{item.menu_price}</td>
                          <td style={{ border: "1px solid #ccc" }}>₹{item.menu_price * item.quantity}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <hr />
                  <p><strong>Total:</strong> ₹{receiptTotal}</p>
                </div>
              )}
            </>
          )}
        </motion.div>
      )}

      {/* Footer */}
      <footer className="footer">
        <p>&copy; 2024 Delicious Bites | All Rights Reserved</p>
      </footer>

      {/* Scroll to Top button */}
      {showScrollTop && (
        <button onClick={scrollToTop} className="scroll-to-top">↑</button>
      )}
    </div>
  );
};

export default App;
