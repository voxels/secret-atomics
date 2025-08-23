import React from "react";
import DarkTheme from "layouts/Dark";
import Navbar from "components/Navbar/navbar";
import WorksStyle3 from "components/Works-style3/works-style3";
import Services6 from "components/Services6/services6";
import ProjectDetails2Header from "components/Project-details2-header/project-details2-header";
import ProjectIntroduction from "components/Project-introduction/project-introduction";
import ProjectGallery from "components/Project-gallery/project-gallery";
import ProjectDescription from "components/Project-description/project-description";
import ProjectVideo from "components/Project-video/project-video";
import ProjectDate from "data/project-details2.json";


const ServicesDark = () => {
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
      <Services6 />
              <ProjectDetails2Header projectHeaderData={ProjectDate} />
        <ProjectIntroduction projectIntroductionData={ProjectDate.intro} />
        <ProjectGallery />
        <ProjectDescription projectDescriptionData={ProjectDate.description} />
        <ProjectVideo projectVideoDate={ProjectDate} />

    </DarkTheme>
  );
};

export const Head = () => {
  return (
    <>
      <title>Secret Atomics Services and Clients</title>
    </>
  )
}

export default ServicesDark;
