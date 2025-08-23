import React from "react";

const ProjectDescription = ({ projectDescriptionData }) => {
  return (
    <section className="intro-section section-padding">
      <div className="container">
        <div className="row">
          <div className="col-lg-3 col-md-4">
            <div className="htit">
              <h4>
                <span>02 </span> Description
              </h4>
            </div>
          </div>
          <div className="col-lg-8 offset-lg-1 col-md-8">
            <div className="text js-scroll__content">
              <p className="extra-text">{projectDescriptionData.content}</p>
              <br></br>
            </div>
            <div className="text js-scroll__content">
              <p className="extra-text">
                AI & Machine Learning
              </p>
              <ul className="smp-list mt-30">
                {projectDescriptionData.ai_ml.map((item) => (
                  <li key={item.id}>{item.name}</li>
                ))}
              </ul>
              <br></br>
              <p className="extra-text">
                iOS Engineering & Performance Optimization
              </p>
              <ul className="smp-list mt-30">
                {projectDescriptionData.ios_engineering.map((item) => (
                  <li key={item.id}>{item.name}</li>
                ))}
              </ul>
              <br></br>
              <p className="extra-text">
                0-to-1 Product Development & Leadership
              </p>
              <ul className="smp-list mt-30">
                {projectDescriptionData.product_development.map((item) => (
                  <li key={item.id}>{item.name}</li>
                ))}
              </ul>
              <br></br>
              <p className="extra-text">
                UX Design & Product Strategy
              </p>
              <ul className="smp-list mt-30">
                {projectDescriptionData.ux_design.map((item) => (
                  <li key={item.id}>{item.name}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProjectDescription;
