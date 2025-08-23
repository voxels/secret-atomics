import React from "react";
import Navbar from "components/Navbar/navbar";
import CallToAction from "components/Call-to-action/call-to-action";
import Footer from "components/Footer/footer";
import PagesHeader from "components/Pages-header";
import AboutIntro from "components/About-intro";
import Team from "components/Team/team";
import DarkTheme from "layouts/Dark";

const About = () => {
  const navbarRef = React.useRef(null);
  const logoRef = React.useRef(null);

  React.useEffect(() => {
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
  }, [navbarRef]);

  return (
    <DarkTheme>
      <Navbar nr={navbarRef} lr={logoRef} from="about-dark" />
      <PagesHeader />
      <AboutIntro />
      <Team />
    </DarkTheme>
  );
};

export const Head = () => {
  return (
    <>
      <title>About Secret Atomics</title>
    </>
  );
};

export default About;