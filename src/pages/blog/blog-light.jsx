import React from "react";
import blog1Data from "data/blog1.json";
import Navbar from "components/Navbar/navbar";
import BlogStanderd from "components/Blog-standerd/blog-standerd";
import PageHeader from "components/Page-header/page-header";
import Footer from "components/Footer/footer";
import LightTheme from "layouts/Light";

const BlogLight = () => {
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
    <LightTheme>
      <div className="circle-bg">
        <div className="circle-color fixed">
          <div className="gradient-circle"></div>
          <div className="gradient-circle two"></div>
        </div>
      </div>
      <Navbar nr={navbarRef} lr={logoRef} theme="themeL" />
      <PageHeader
        title="Our News."
        paragraph="All the most current news and events of our creative team."
      />
      <BlogStanderd blogs={blog1Data} />
      <Footer />
    </LightTheme>
  );
};

export const Head = () => {
  return (
    <>
      <title>Vie - Blog Light</title>
    </>
  )
}

export default BlogLight;
