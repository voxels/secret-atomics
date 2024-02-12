import React from "react";
import { Link } from 'gatsby'

const Blogs2 = () => {
  return (
    <section className="blog-list section-padding sub-bg">
      <div className="container">
        <div className="row">
          <div className="col-lg-4">
            <div className="head md-mb50">
              <h6 className="back-color">Get The Latest News</h6>
              <h3>What we're thinking lately</h3>
              <p>
                We explore a number of different emerging technologies.
              </p>
              <Link to="https://www.noisederived.com">
                <span>More Blog Posts</span>
              </Link>
            </div>
          </div>
          <div className="col-lg-7 offset-lg-1">
            <div className="item wow fadeInUp" data-wow-delay=".3s">
              <div className="img valign">
                <img src="/img/blog/3.jpg" alt="" />
              </div>
              <div className="cont valign">
                <div>
                  <div className="info">
                    <Link to="/blog/blog-dark" className="date">
                      <span>
                        <i>06</i> December
                      </span>
                    </Link>
                    <span>/</span>
                    <Link to="/blog/blog-dark" className="tag">
                      <span>Noise Derived</span>
                    </Link>
                  </div>
                  <h5>
                    <Link to="/blog-details/blog-details-dark">
                      Exploring Data Visualization on the Vision Pro
                    </Link>
                  </h5>
                </div>
              </div>
            </div>
            <div className="item wow fadeInUp" data-wow-delay=".3s">
              <div className="img valign">
                <img src="/img/blog/1.jpg" alt="" />
              </div>
              <div className="cont valign">
                <div>
                  <div className="info">
                    <Link to="https://noisederived.com/blog/know-maps-a-visionos-place-discovery-app/" className="date">
                      <span>
                        <i>21</i> November
                      </span>
                    </Link>
                    <span>/</span>
                    <Link to="https://noisederived.com/blog/know-maps-a-visionos-place-discovery-app/" className="tag">
                      <span>Noise Derived</span>
                    </Link>
                  </div>
                  <h5>
                    <Link to="https://noisederived.com/blog/know-maps-a-visionos-place-discovery-app/">
Know Maps: A VisionOS Place Discovery App
                    </Link>
                  </h5>
                </div>
              </div>
            </div>
            <div className="item wow fadeInUp" data-wow-delay=".5s">
              <div className="img valign">
                <img src="/img/blog/2.jpg" alt="" />
              </div>
              <div className="cont valign">
                <div>
                  <div className="info">
                    <Link to="https://noisederived.com/blog/using-nuitrack-skeleton-tracking-to-drive-a-metahuman-skeleton/" className="date">
                      <span>
                        <i>25</i> October
                      </span>
                    </Link>
                    <span>/</span>
                    <Link to="https://noisederived.com/blog/using-nuitrack-skeleton-tracking-to-drive-a-metahuman-skeleton/" className="tag">
                      <span>Noise Derived</span>
                    </Link>
                  </div>
                  <h5>
                    <Link to="https://noisederived.com/blog/using-nuitrack-skeleton-tracking-to-drive-a-metahuman-skeleton/">
                      Using Nuitrack skeleton tracking to drive a Metahuman skeleton
                    </Link>
                  </h5>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};

export default Blogs2;
