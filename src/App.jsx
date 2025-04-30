import React, { useEffect, useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const App = () => {
  const getTodayDate = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const getCurrentTime = () => {
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, "0");
    const mm = String(now.getMinutes()).padStart(2, "0");
    return `${hh}:${mm}`;
  };

  const [menuItems, setMenuItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [categorizedMenu, setCategorizedMenu] = useState({});
  const [activeCategory, setActiveCategory] = useState(null);
  const [cart, setCart] = useState([]);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [cottages, setCottages] = useState([]);

  const [userDetails, setUserDetails] = useState({
    name: "",
    contact: "",
    date: getTodayDate(),
    time: getCurrentTime(),
    cottage_id: "",
  });

  useEffect(() => {
    fetchMenu();
    fetchCottages();
  }, []);

  const fetchMenu = async () => {
    try {
      const response = await axios.get("http://localhost:2025/menucard");
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

  const fetchCottages = async () => {
    try {
      const response = await axios.get("http://localhost:2025/getcottages");
      setCottages(response.data.cottages);
    } catch (error) {
      toast.error("Failed to fetch cottages");
    }
  };

  const handleSearch = (e) => setSearchQuery(e.target.value.toLowerCase());

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
      setCart([...cart, { ...item, quantity: 1, quantityType }]);
    }
    toast.success(`${item.menu_name} (${quantityType}) added to cart`);
  };

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

  const getCartQuantity = (itemName, quantityType) => {
    const item = cart.find(
      (i) => i.menu_name === itemName && i.quantityType === quantityType
    );
    return item ? item.quantity : 0;
  };

  const totalAmount = cart.reduce(
    (sum, item) => sum + item.menu_price * item.quantity,
    0
  );

  const generateReceiptPDF = async () => {
    const { name, contact, date, time, cottage_id } = userDetails;
    const cottage = cottages.find((c) => c.id.toString() === cottage_id);
    const cottageText = cottage ? `${cottage.name}` : "N/A";
  
    const div = document.createElement("div");
    div.id = "receipt-content";
    div.style.width = "280px";
    div.style.padding = "10px";
    div.style.fontFamily = "Arial";
    div.innerHTML = `
      <div style="font-size: 12px;">
        <h2 style="text-align:center; margin:0;">Royal Bee Retreat</h2>
        <h3 style="text-align:center; margin:5px 0;">🍽️ Your Order Details</h3>
        <hr />
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Contact:</strong> ${contact}</p>
        <p><strong>Cottage:</strong> ${cottageText}</p>
        <p><strong>Date:</strong> ${date}</p>
        <p><strong>Time:</strong> ${time}</p>
        <hr />
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr>
              <th align="left">Item</th>
              <th align="center">Qty</th>
              <th align="right">Price</th>
              <th align="right">Total</th>
            </tr>
          </thead>
          <tbody>
            ${cart
              .map(
                (item) => `
                <tr>
                  <td>${item.menu_name}</td>
                  <td align="center">${item.quantity}</td>
                  <td align="right">₹${item.menu_price}</td>
                  <td align="right">₹${item.menu_price * item.quantity}</td>
                </tr>`
              )
              .join("")}
          </tbody>
        </table>
        <hr />
        <p style="text-align:right;"><strong>Total: ₹${totalAmount}</strong></p>
        <p style="text-align:center;">Enjoy your stay at Royal Bee Retreat!</p>
      </div>
    `;
  
    document.body.appendChild(div);
  
    try {
      const canvas = await html2canvas(div);
      const imgData = canvas.toDataURL("image/png");
  
      const pdfWidth = 280;
      const pdfHeight = canvas.height * (pdfWidth / canvas.width);
  
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "pt",
        format: [pdfWidth, pdfHeight],
      });
  
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
  
      const safe = (str) =>
        String(str).replace(/\s+/g, "").replace(/[^\w\d]/g, "");
  
      const fileName = `${safe(name)}_${safe(contact)}_${cottage ? safe(cottage.name) : "NOCottage"}.pdf`;
  
      pdf.save(fileName);
    } catch (error) {
      console.error("Receipt error:", error);
      toast.error("Failed to generate receipt");
    }
  
    document.body.removeChild(div);
  };
  

  const handleOrder = async () => {
    const { name, contact, date, time, cottage_id } = userDetails;
    if (!name || !contact || !date || !time || !cottage_id) {
      toast.error("Please fill all details");
      return;
    }
    if (contact.length !== 10) {
      toast.error("Contact number must be exactly 10 digits");
      return;
    }

    try {
      const payload = {
        name,
        contact,
        date,
        time,
        cart: cart.map((item) => ({
          mid: item.mid,
          menu_name: item.menu_name,
          quantity: item.quantity,
          menu_price: item.menu_price,
          quantity_type: item.quantityType,
        })),
        cottage_id,
      };

      const response = await axios.post("http://localhost:2025/placeorder", payload);
      if (response.status === 200) {
        toast.success("Order placed successfully!");
        await generateReceiptPDF();
        setCart([]);
        setUserDetails({
          name: "",
          contact: "",
          date: getTodayDate(),
          time: getCurrentTime(),
          cottage_id: "",
        });
        setShowOrderForm(false);
      } else {
        toast.error("Error placing order");
      }
    } catch (error) {
      console.error("Order error:", error);
      toast.error("Failed to place order");
    }
  };

  return (
    <div>
      <ToastContainer position="top-left" autoClose={3000} />
      <header className="header">
        <h1>Royal Bee Retreat</h1>
        <p>Savor the Flavor, Enjoy the Moment</p>
      </header>

      <div className="view-cart-bubble" onClick={() => setShowOrderForm(!showOrderForm)}>
        🛒 Cart <span className="cart-count">{cart.length}</span>
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
            <p className="text-center">Loading Menu...</p>
          ) : (
            <div className="menu-grid">
              {categorizedMenu[activeCategory]
                .filter((item) => item.menu_name.toLowerCase().includes(searchQuery))
                .map((item, idx) => {
                  const qty = getCartQuantity(item.menu_name, item.quantity || "N/A");
                  return (
                    <div key={idx} className="menu-card">
                      {item.image && <img src={item.image} alt={item.menu_name} className="menu-image" />}
                      <h5>{item.menu_name}</h5>
                      <p>₹{item.menu_price}</p>
                      <p><strong>Quantity:</strong> {item.quantity}</p>
                      <div className="qty-buttons">
                        <button onClick={() => updateQuantity({ menu_name: item.menu_name, quantityType: item.quantity || "N/A" }, -1)}>-</button>
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
                      <strong>{item.menu_name}</strong> ({item.quantityType || "N/A"}) — ₹{item.menu_price} × {item.quantity}
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
                <select value={userDetails.cottage_id} onChange={(e) => setUserDetails({ ...userDetails, cottage_id: e.target.value })}>
                  <option value="">Select Cottage</option>
                  {cottages.map((cottage) => (
                    <option key={cottage.id} value={cottage.id}>{cottage.name} ({cottage.location})</option>
                  ))}
                </select>
                <input type="date" value={userDetails.date} min={getTodayDate()} onChange={(e) => setUserDetails({ ...userDetails, date: e.target.value })} />
                <input type="time" value={userDetails.time} onChange={(e) => setUserDetails({ ...userDetails, time: e.target.value })} />
                <button onClick={handleOrder} className="btn btn-success">Place Order</button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default App;
