import React from "react";
import Navbar from "components/Navbar/navbar";
import AboutUs4 from "components/About-us4/about-us4";  
import CallToAction from "components/Call-to-action/call-to-action";
import Footer from "components/Footer/footer";
import Services4 from "components/Services4/services4";
import DarkTheme from "layouts/Dark";

const Homepage1 = () => {
  const fixedSlider = React.useRef(null);
  const MainContent = React.useRef(null);
  const navbarRef = React.useRef(null);
  const logoRef = React.useRef(null);

  React.useEffect(() => {
    setTimeout(() => {
      if (fixedSlider.current) {
        var slidHeight = fixedSlider.current.offsetHeight;
      }
      if (MainContent.current) {
        MainContent.current.style.marginTop = slidHeight + "px";
      }
    }, 1000);

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
  }, [fixedSlider, MainContent, navbarRef]);

  return (
    <DarkTheme>
      <Navbar nr={navbarRef} lr={logoRef} />
      <div ref={MainContent} className="main-content">
      <Services4 serviceMB50 />
      <AboutUs4 />
      <CallToAction img="/img/patrn1.png" />
      <Footer />
      </div>
    </DarkTheme>
  );
};

export const Head = () => {
  return (
    <>
      <title>Secret Atomics: Product Design and Engineering Studio for Apple Platforms</title>
    </>
  )
}

export default Homepage1;
