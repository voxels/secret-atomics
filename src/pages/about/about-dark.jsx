import React from "react";
import Navbar from "components/Navbar/navbar";
import IntroWithSlider from "components/Intro-with-slider/intro-with-slider";
import Services from "components/Services/services";
import VideoWithTestimonials from "components/Video-with-testimonials/video-with-testimonials";
import SkillsCircle from "components/Skills-circle/skills-circle";
import Clients from "components/Clients/clients";
import CallToAction from "components/Call-to-action/call-to-action";
import Footer from "components/Footer/footer";
import PagesHeader from "components/Pages-header";
import AboutIntro from "components/About-intro";
import Team from "components/Team/team";
import MinimalArea from "components/Minimal-Area/minimal-area";
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

  // Raw HTML content
  const rawHTML = `<!-- Calendly inline widget begin -->
<div class="calendly-inline-widget" data-url="https://calendly.com/voxels-noisederived/30min" style="min-width:320px;height:700px;"></div>
<script type="text/javascript" src="https://assets.calendly.com/assets/external/widget.js" async></script>
<!-- Calendly inline widget end -->`;

  return (
    <DarkTheme>
      <Navbar nr={navbarRef} lr={logoRef} from="about-dark" />
      <PagesHeader />
      <IntroWithSlider />
      <AboutIntro />
      <div dangerouslySetInnerHTML={{ __html: rawHTML }} />
      <Services style="4item" />
      <Team />
      <CallToAction />
      <Footer />
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