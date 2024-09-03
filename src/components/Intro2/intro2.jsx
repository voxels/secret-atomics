import React from 'react'
import { Link } from 'gatsby'

const Intro2 = ({ sliderRef }) => {

  return (
    <header ref={sliderRef} className="slider-st valign position-re">
      <div className="container">
        <div className="row">
          <div className="col-lg-6 valign">
            <div className="cont md-mb50">
              <div className="sub-title mb-5">
                <h6>Product Design Studio</h6>
              </div>
              <h1 className="mb-10 fw-600">Reach out to us.</h1>
              <p>
                Tell us about what you want to build.
              </p>
              <Link
                to={`https://calendly.com/voxels-noisederived/30min`}
                className="butn bord curve mt-30"
              >
                <span>Schedule an Appointment</span>
              </Link>
            </div>
          </div>
          <div className="col-lg-6">
            <div className="img">
              <img src="/img/slid/01.jpg" alt="" />
            </div>
          </div>
        </div>
      </div>
      <div className="line bottom left"></div>
    </header>
  );
};

export default Intro2