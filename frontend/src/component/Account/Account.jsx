"use client"
import React from "react"
import { useState, useEffect, useCallback } from "react"
import { NavLink, Outlet } from "react-router-dom"
import Navbar from "../Navbar"

const Account = () => {
  const [activeItem, setActiveItem] = useState(null)
  const [contentHeight, setContentHeight] = useState("100vh")

  // Function to update content height
  const updateContentHeight = useCallback(() => {
    const mainContent = document.getElementById("main-content")
    if (mainContent) {
      const contentHeight = mainContent.scrollHeight
      const viewportHeight = window.innerHeight
      const navbarHeight = 60 // Height of the navbar
      setContentHeight(`${Math.max(contentHeight + navbarHeight, viewportHeight)}px`)
    }
  }, [])

  // Update height on mount and when content changes
  useEffect(() => {
    updateContentHeight()
    // Add resize listener
    window.addEventListener("resize", updateContentHeight)

    // Create a MutationObserver to watch for content changes
    const observer = new MutationObserver(updateContentHeight)
    const mainContent = document.getElementById("main-content")
    if (mainContent) {
      observer.observe(mainContent, {
        childList: true,
        subtree: true,
        attributes: true,
      })
    }

    // Cleanup
    return () => {
      window.removeEventListener("resize", updateContentHeight)
      observer.disconnect()
    }
  }, [updateContentHeight])

  // Inline styles
  const styles = {
    container: {
      display: "flex",
      minHeight: contentHeight,
      backgroundColor: "#FFFFFF", // Changed to white background
      position: "relative",
    },
    sidebar: {
      width: "250px",
      backgroundColor: "#F5F7FA", // Lighter gray color matching the image
      height: "100%",
      padding: "20px",
      fontFamily: "Arial, sans-serif",
      position: "sticky",
      top: "60px", // Stick below navbar
      overflowY: "auto",
      maxHeight: `calc(100vh - 60px)`, // Subtract navbar height
      borderRight: "none", // Remove border
    },
    sidebarHeading: {
      color: "#333333",
      fontSize: "20px", // Slightly smaller
      fontWeight: "bold",
      textAlign: "left", // Left aligned instead of center
      marginBottom: "25px",
      padding: "10px 0",
      borderBottom: "none", // Remove border
    },
    navList: {
      listStyle: "none",
      padding: "0",
      margin: "0",
    },
    navItem: {
      marginBottom: "8px",
    },
    navLink: (isActive) => ({
      display: "block",
      padding: "10px 15px",
      fontSize: "14px", // Smaller font
      fontWeight: isActive ? "600" : "400", // Only bold when active
      color: isActive ? "#1E40AF" : "#4B5563", // Darker gray for inactive
      textDecoration: "none",
      borderRadius: "4px",
      backgroundColor: isActive ? "#EFF6FF" : "transparent", // Lighter blue background when active
      transition: "all 0.2s ease",
    }),
    navLinkHover: {
      backgroundColor: "#F3F4F6", // Very subtle hover effect
    },
    mainContent: {
      flexGrow: 1,
      padding: "20px 30px",
      background: "#ffffff",
      color: "#333333",
      minHeight: `calc(100vh - 60px)`,
      overflowX: "hidden",
    },
    mainWrapper: {
      display: "flex",
      flexDirection: "column",
      minHeight: `calc(100vh - 60px)`, // Minimum height minus navbar
    },
  }

  const navItems = [
    { title: "Login Detail", icon: "👤" },
  
  ]

  return (
    <div style={styles.mainWrapper}>
      <Navbar />
      <div style={styles.container}>
        {/* Sidebar */}
        <aside style={styles.sidebar}>
          <h2 style={styles.sidebarHeading}>Account</h2>
          <ul style={styles.navList}>
            {navItems.map((item, index) => (
              <li
                key={index}
                style={{
                  ...styles.navItem,
                  ...(activeItem === index ? styles.navLinkHover : {}),
                }}
                onMouseEnter={() => setActiveItem(index)}
                onMouseLeave={() => setActiveItem(null)}
              >
                <NavLink
                  to={`/account/${item.title.toLowerCase().replace(/\s+/g, "")}`}
                  style={({ isActive }) => ({
                    ...styles.navLink(isActive),
                    ...(activeItem === index ? styles.navLinkHover : {}),
                  })}
                >
                  <span style={{ marginRight: "10px" }}>{item.icon}</span>
                  {item.title}
                </NavLink>
              </li>
            ))}
          </ul>
        </aside>

        {/* Main Content */}
        <main id="main-content" style={styles.mainContent}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default Account
