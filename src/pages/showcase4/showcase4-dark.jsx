import React from "react";
import DarkTheme from "layouts/Dark";
import Navbar from "components/Navbar/navbar";
import WorksStyle3 from "components/Works-style3/works-style3";
import Footer from "components/Footer/footer";

const Showcase4Dark = () => {
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
      <WorksStyle3 />
      <Footer />
    </DarkTheme>
  );
};

export const Head = () => {
  return (
    <>
      <title>Vie - Showcase 4 Dark</title>
    </>
  )
}

export default Showcase4Dark;
