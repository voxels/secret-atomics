import React from "react";
import Navbar from "components/Navbar/navbar";
import Footer from "components/Footer/footer";
import Intro2 from "components/Intro2/intro2";
import DarkTheme from "layouts/Dark";

const Contact = () => {
  const navbarRef = React.useRef(null);
  const logoRef = React.useRef(null);

  React.useEffect(() => {
    document.querySelector("body").classList.add("contact-page");

    var navbar = navbarRef.current;

    if (window.pageYOffset > 300) {
      navbar.classList.add("nav-scroll");
    } else {
      navbar.classList.remove("nav-scroll");
    }

    window.addEventListener("scroll", () => {
      if (window.pageYOffset > 300) {
        navbar.classList.add("nav-scroll");
      } else {
        navbar.classList.remove("nav-scroll");
      }
    });

    return () => {
      document.querySelector("body").classList.remove("contact-page");
    };
  }, [navbarRef]);

  return (
    <DarkTheme>
      <Navbar nr={navbarRef} lr={logoRef} />
      <div className="main-content">
      <Intro2 />
      </div>
    </DarkTheme>
  );
};

export const Head = () => {
  return (
    <>
      <title>Contact Secret Atomics</title>
    </>
  )
}

export default Contact;
