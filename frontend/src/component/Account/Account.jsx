"use client"
import React from "react"
import { useState, useEffect, useCallback } from "react"
import { NavLink, Outlet } from "react-router-dom"
import Navbar from "../Navbar"

const Account = () => {
  const [activeItem, setActiveItem] = useState(null)
  const [contentHeight, setContentHeight] = useState("100vh")

  const updateContentHeight = useCallback(() => {
    const mainContent = document.getElementById("main-content")
    if (mainContent) {
      const contentHeight = mainContent.scrollHeight
      const viewportHeight = window.innerHeight
      const navbarHeight = 60
      setContentHeight(`${Math.max(contentHeight + navbarHeight, viewportHeight)}px`)
    }
  }, [])

  useEffect(() => {
    updateContentHeight()
    window.addEventListener("resize", updateContentHeight)

    const observer = new MutationObserver(updateContentHeight)
    const mainContent = document.getElementById("main-content")
    if (mainContent) {
      observer.observe(mainContent, {
        childList: true,
        subtree: true,
        attributes: true,
      })
    }

    return () => {
      window.removeEventListener("resize", updateContentHeight)
      observer.disconnect()
    }
  }, [updateContentHeight])

  const styles = {
    container: {
      display: "flex",
      minHeight: contentHeight,
      backgroundColor: "#F9FAFB",
      position: "relative",
    },
    sidebar: {
      width: "250px",
      backgroundColor: "#FFFFFF",
      height: "100%",
      padding: "24px 20px",
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      position: "sticky",
      top: "60px",
      overflowY: "auto",
      maxHeight: `calc(100vh - 60px)`,
      borderRight: "1px solid #E5E7EB",
      boxShadow: "2px 0 6px rgba(0, 0, 0, 0.05)",
    },
    sidebarHeading: {
      color: "#111827",
      fontSize: "18px",
      fontWeight: "600",
      textAlign: "left",
      marginBottom: "20px",
      paddingBottom: "10px",
      borderBottom: "1px solid #E5E7EB",
    },
    navList: {
      listStyle: "none",
      padding: 0,
      margin: 0,
    },
    navItem: {
      marginBottom: "10px",
    },
    navLink: (isActive) => ({
      display: "flex",
      alignItems: "center",
      padding: "10px 15px",
      fontSize: "15px",
      fontWeight: isActive ? "600" : "500",
      color: isActive ? "#1D4ED8" : "#374151",
      textDecoration: "none",
      borderRadius: "6px",
      backgroundColor: isActive ? "#E0F2FE" : "transparent",
      transition: "background-color 0.3s, color 0.3s, box-shadow 0.3s",
      boxShadow: isActive ? "inset 0 0 0 1px #93C5FD" : "none",
    }),
    navLinkHover: {
      backgroundColor: "#F3F4F6",
    },
    mainContent: {
      flexGrow: 1,
      padding: "30px 40px",
      backgroundColor: "#FFFFFF",
      color: "#1F2937",
      minHeight: `calc(100vh - 60px)`,
      overflowX: "hidden",
      boxShadow: "inset 0 1px 0 rgba(0,0,0,0.03)",
    },
    mainWrapper: {
      display: "flex",
      flexDirection: "column",
      minHeight: `calc(100vh - 60px)`,
    },
  }

  const navItems = [
    { title: "Login Detail", icon: "👤" },
  ]

  return (
    <div style={styles.mainWrapper}>
      <Navbar />
      <div style={styles.container}>
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
                    ...(activeItem === index && !isActive ? styles.navLinkHover : {}),
                  })}
                >
                  <span style={{ marginRight: "10px" }}>{item.icon}</span>
                  {item.title}
                </NavLink>
              </li>
            ))}
          </ul>
        </aside>

        <main id="main-content" style={styles.mainContent}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default Account
