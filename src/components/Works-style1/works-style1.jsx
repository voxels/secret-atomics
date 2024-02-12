import React from "react";
import { Link } from "gatsby";
import tooltipEffect from "common/tooltipEffect";

const WorksStyle1 = () => {
  React.useEffect(() => {
    setTimeout(() => {
      tooltipEffect();
    }, 100);
  }, []);

  return (
    <section className="works section-padding pb-70">
      <h2 style={{ display: 'none' }}>&nbsp;</h2>
      <div className="container">
        <div className="row lg-space">
          <div className="col-lg-4 col-md-6">
            <div className="item">
              <Link to={`/project-details2/project-details2-dark`}>
                <div className="img" data-tooltip-tit="Work image" data-tooltip-sub="Design">
                  <img src="/img/portfolio/portfolio/1/1.jpg" alt="" />
                </div>
              </Link>
            </div>
          </div>
          <div className="col-lg-4 col-md-6 valign">
            <div className="item">
              <Link to={`/project-details2/project-details2-dark`}>
                <div className="img" data-tooltip-tit="Work image" data-tooltip-sub="Design">
                  <img src="/img/portfolio/portfolio/2/1.jpg" alt="" />
                </div>
              </Link>
            </div>
          </div>
          <div className="col-lg-4 col-md-6">
            <div className="item">
              <Link to={`/project-details2/project-details2-dark`}>
                <div className="img" data-tooltip-tit="Work image" data-tooltip-sub="Design">
                  <img src="/img/portfolio/portfolio/1/2.jpg" alt="" />
                </div>
              </Link>
            </div>
          </div>
          <div className="col-lg-4 col-md-6 valign">
            <div className="item">
              <Link to={`/project-details2/project-details2-dark`}>
                <div className="img" data-tooltip-tit="Work image" data-tooltip-sub="Design">
                  <img src="/img/portfolio/portfolio/2/3.jpg" alt="" />
                </div>
              </Link>
            </div>
          </div>
          <div className="col-lg-4 col-md-6">
            <div className="item">
              <Link to={`/project-details2/project-details2-dark`}>
                <div className="img" data-tooltip-tit="Work image" data-tooltip-sub="Design">
                  <img src="/img/portfolio/portfolio/1/3.jpg" alt="" />
                </div>
              </Link>
            </div>
          </div>
          <div className="col-lg-4 col-md-6 valign">
            <div className="item">
              <Link to={`/project-details2/project-details2-dark`}>
                <div className="img" data-tooltip-tit="Work image" data-tooltip-sub="Design">
                  <img src="/img/portfolio/portfolio/2/4.jpg" alt="" />
                </div>
              </Link>
            </div>
          </div>
          <div className="col-lg-4 col-md-6">
            <div className="item">
              <Link to={`/project-details2/project-details2-dark`}>
                <div className="img" data-tooltip-tit="Work image" data-tooltip-sub="Design">
                  <img src="/img/portfolio/portfolio/1/4.jpg" alt="" />
                </div>
              </Link>
            </div>
          </div>
          <div className="col-lg-4 col-md-6 valign">
            <div className="item">
              <Link to={`/project-details2/project-details2-dark`}>
                <div className="img" data-tooltip-tit="Work image" data-tooltip-sub="Design">
                  <img src="/img/portfolio/portfolio/2/5.jpg" alt="" />
                </div>
              </Link>
            </div>
          </div>
          <div className="col-lg-4 col-md-6">
            <div className="item">
              <Link to={`/project-details2/project-details2-dark`}>
                <div className="img" data-tooltip-tit="Work image" data-tooltip-sub="Design">
                  <img src="/img/portfolio/portfolio/1/5.jpg" alt="" />
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WorksStyle1;
