import React from "react";
import Navbar from "components/Navbar/navbar";
import Footer from "components/Footer/footer";
import ContactHeader from "components/Contact-header/contact-header";
import ContactForm from "components/Contact-form/contact-form";
import DarkTheme from "layouts/Dark";

  // Raw HTML content
  const rawHTML = `<!-- Calendly inline widget begin -->
<div class="calendly-inline-widget" data-url="https://calendly.com/voxels-noisederived/30min" style="min-width:320px;height:700px;"></div>
<script type="text/javascript" src="https://assets.calendly.com/assets/external/widget.js" async></script>
<!-- Calendly inline widget end -->`;


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
      <ContactHeader />
      <div className="main-content">
      <div dangerouslySetInnerHTML={{ __html: rawHTML }} />
        <Footer hideBGCOLOR />
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
