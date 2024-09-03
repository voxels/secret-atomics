import React from "react";
import initIsotope from "common/initIsotope";

const WorksStyle3 = () => {
  React.useEffect(() => {
    setTimeout(() => {
      initIsotope();
    }, 1000);
  }, []);

  return (
    <section className="portfolio-cr section-padding pb-50">
       <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-10">
            <div className="cont mt-100 mb-50 text-center">
              <h1 className="color-font fw-700">
                 Product Design and Engineering Clients
              </h1>
            </div>
          </div>
        </div>
      </div>
      <div className="half sub-bg">
        <div className="circle-color">
          <div className="gradient-circle"></div>
          <div className="gradient-circle two"></div>
        </div>
      </div>
      <div className="container">
        <div className="row">
          <div className="filtering text-center col-12">
            <div className="filter">
              <span data-filter="*" className="active">
                All
              </span>
              <span data-filter=".google">Google</span>
              <span data-filter=".samsung">Samsung</span>
              <span data-filter=".viacom">Viacom</span>
              <span data-filter=".games">Games</span>
              <span data-filter=".startups">Startups</span>
            </div>
          </div>
          </div>

          <div className="gallery-mons full-width">
            <div className="items width2 google wow fadeInUp" data-wow-delay=".4s">
              <div className="item-img">
                  <img src="/img/portfolio/cr/google_1.PNG" alt="image" />
                  <div className="item-img-overlay"></div>
              </div>
              <div className="cont flex">
                <h6 className="color-font">UX Engineering</h6>
                <span>
                  <a href="#0">Google Maps</a>
                </span>
              </div>
            </div>

            <div className="items width2 google wow fadeInUp" data-wow-delay=".4s">
              <div className="item-img">
                  <img src="/img/portfolio/cr/google_2.PNG" alt="image" />
                  <div className="item-img-overlay"></div>
              </div>
              <div className="cont flex">
                <h6 className="color-font">Thought Leadership</h6>
                <span>
                  <a href="#0">Google Maps</a>
                </span>
              </div>
            </div>

            <div
              className="items width2 google wow fadeInUp"
              data-wow-delay=".4s"
            >
              <div className="item-img">
                  <img src="/img/portfolio/cr/google_3.PNG" alt="image" />
                  <div className="item-img-overlay"></div>
              </div>
              <div className="cont">
                <h6 className="color-font">Research and Development</h6>
                <span>
                  <a href="#0">Google Maps</a>
                </span>
              </div>
            </div>

            <div
              className="items width2 samsung wow fadeInUp"
              data-wow-delay=".4s"
            >
              <div className="item-img">
                
                  <img src="/img/portfolio/cr/samsung_yarn_0.PNG" alt="image" />
                  <div className="item-img-overlay"></div>
              </div>
              <div className="cont">
                <h6 className="color-font">iOS Engineering</h6>
                <span>
                  <a href="#0">Yarn</a>
                </span>
              </div>
            </div>

                        <div
              className="items width2 samsung wow fadeInUp"
              data-wow-delay=".4s"
            >
              <div className="item-img">
                
                  <img src="/img/portfolio/cr/samsung_yarn_1.PNG" alt="image" />
                  <div className="item-img-overlay"></div>
              </div>
              <div className="cont">
                <h6 className="color-font">Incubator</h6>
                <span>
                  <a href="#0">Yarn</a>
                </span>
              </div>
            </div>

            <div
              className="items width2 samsung wow fadeInUp"
              data-wow-delay=".4s"
            >
              <div className="item-img">
                
                  <img src="/img/portfolio/cr/samsung_yarn_2.PNG" alt="image" />
                  <div className="item-img-overlay"></div>
              </div>
              <div className="cont">
                <h6 className="color-font">UX Design</h6>
                <span>
                  <a href="#0">Yarn</a>
                </span>
              </div>
            </div>

<div
              className="items width2 viacom wow fadeInUp"
              data-wow-delay=".4s"
            >
              <div className="item-img">
                
                  <img src="/img/portfolio/cr/viacom_1.PNG" alt="image" />
                  <div className="item-img-overlay"></div>
              </div>I
                <h6 className="color-font">Web Integration</h6>
                <span>
                  <a href="#0">MTV News</a>
                </span>
              </div>


<div
              className="items width2 games wow fadeInUp"
              data-wow-delay=".4s"
            >
              <div className="item-img">
                
                  <img src="/img/portfolio/cr/games_evilapples_1.PNG" alt="image" />
                  <div className="item-img-overlay"></div>
              </div>I
                <h6 className="color-font">StoreKit Development</h6>
                <span>
                  <a href="#0">Evil Apples</a>
                </span>
              </div>

<div
              className="items width2 games wow fadeInUp"
              data-wow-delay=".4s"
            >
              <div className="item-img">
                
                  <img src="/img/portfolio/cr/games_evilapples_2.PNG" alt="image" />
                  <div className="item-img-overlay"></div>
              </div>I
                <h6 className="color-font">UIKit Animation</h6>
                <span>
                  <a href="#0">Evil Apples</a>
                </span>
              </div>

<div
              className="items width2 games wow fadeInUp"
              data-wow-delay=".4s"
            >
              <div className="item-img">
                
                  <img src="/img/portfolio/cr/games_evilapples_3.PNG" alt="image" />
                  <div className="item-img-overlay"></div>
              </div>I
                <h6 className="color-font">Online Gaming</h6>
                <span>
                  <a href="#0">Evil Apples</a>
                </span>
              </div>

              <div
              className="items width2 games wow fadeInUp"
              data-wow-delay=".4s"
            >
              <div className="item-img">
                
                  <img src="/img/portfolio/cr/games_homer_1.PNG" alt="image" />
                  <div className="item-img-overlay"></div>
              </div>I
                <h6 className="color-font">Gamification</h6>
                <span>
                  <a href="#0">Homer Learning</a>
                </span>
              </div>


              <div
              className="items width2 games wow fadeInUp"
              data-wow-delay=".4s"
            >
              <div className="item-img">
                
                  <img src="/img/portfolio/cr/games_homer_2.PNG" alt="image" />
                  <div className="item-img-overlay"></div>
              </div>I
                <h6 className="color-font">Child Education</h6>
                <span>
                  <a href="#0">Homer Learning</a>
                </span>
              </div>

              <div
              className="items width2 startups wow fadeInUp"
              data-wow-delay=".4s"
            >
              <div className="item-img">
                
                  <img src="/img/portfolio/cr/startups_beautified_1.PNG" alt="image" />
                  <div className="item-img-overlay"></div>
              </div>I
                <h6 className="color-font">Full Stack Engineering</h6>
                <span>
                  <a href="#0">Beautified</a>
                </span>
              </div>


<div
              className="items width2 startups wow fadeInUp"
              data-wow-delay=".4s"
            >
              <div className="item-img">
                
                  <img src="/img/portfolio/cr/startups_beautified_2.PNG" alt="image" />
                  <div className="item-img-overlay"></div>
              </div>I
                <h6 className="color-font">iOS App Store Fulfillment</h6>
                <span>
                  <a href="#0">Beautified</a>
                </span>
              </div>


              <div
              className="items width2 startups wow fadeInUp"
              data-wow-delay=".4s"
            >
              <div className="item-img">
                
                  <img src="/img/portfolio/cr/startups_liquorcabinet_1.PNG" alt="image" />
                  <div className="item-img-overlay"></div>
              </div>I
                <h6 className="color-font">Project Management</h6>
                <span>
                  <a href="#0">The Liquor Cabinet</a>
                </span>
              </div>

                            <div
              className="items width2 startups wow fadeInUp"
              data-wow-delay=".4s"
            >
              <div className="item-img">
                
                  <img src="/img/portfolio/cr/startups_liquorcabinet_2.PNG" alt="image" />
                  <div className="item-img-overlay"></div>
              </div>I
                <h6 className="color-font">Full Stack Development</h6>
                <span>
                  <a href="#0">The Liquor Cabinet</a>
                </span>
              </div>


            </div>
          </div>
    </section>
  );
};

export default WorksStyle3;
