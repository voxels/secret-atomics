import React from 'react'
import ModalVideo from "react-modal-video";
import "react-modal-video/css/modal-video.css";

const AboutUs4 = () => {
  const [isOpen, setOpen] = React.useState(false);
  return (
    <section className="about-cr">
      <div className="container-fluid">
        <div className="row">
          <div className="col-lg-6 img md-mb50">
            <img src="/img/slid/03.jpg" alt="" />
          </div>
          <div className="col-lg-4 valign">
            <div className="cont full-width">
              <h3 className="color-font">Pushing boundaries</h3>
              <h6>
                for billions of users
              </h6>
              {typeof window !== "undefined" && (
                <ModalVideo
                  channel="youtube"
                  autoplay
                  isOpen={isOpen}
                  videoId="-x-kdBgQYp8"
                  onClose={() => setOpen(false)}
                />
              )}
              <div className="vid-area">
                <div className="vid-icon">
                  <a
                    className="vid"
                    href="https://youtu.be/-x-kdBgQYp8"
                    onClick={(e) => {
                      e.preventDefault();
                      setOpen(true);
                    }}
                  >
                    <div className="vid-butn back-color">
                      <span className="icon">
                        <i className="fas fa-play"></i>
                      </span>
                    </div>
                  </a>
                </div>
                <div className="valign">
                  <span className="text">Watch our visionPro highlights</span>
                </div>
              </div>
              <div className="states">
                <h2 className="color-font fw-700">
                  25 <span className="fz-30">years</span>
                </h2>
                <p>launching products with venture-backed startups, non-profits, and solo-entrepreneurs, and Fortune 20 companies</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default AboutUs4