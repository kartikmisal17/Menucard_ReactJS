import React, { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

const App = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [categorizedMenu, setCategorizedMenu] = useState({});
  const [activeCategory, setActiveCategory] = useState(null);

  useEffect(() => {
    fetchMenu();
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
      console.error("Error fetching menu:", error);
    } finally {
      setLoading(false);
    }
  };

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
    </div>
  );
};

export default App;
