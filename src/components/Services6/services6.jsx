import React from "react";

const Services6 = () => {
  return (
    <section className="serv-arch">
      <div className="container-fluid">
        <div className="row justify-content-center">
          <div
            className="col-lg col-md-6 item bg-img"
            style={{ backgroundImage: "url(/img/arch/s2.jpg)" }}
          >
            <h6 className="numb">01</h6>
            <h5>Product Strategy & Consulting</h5>
            <p>
              <ul>
                <li><i>Market Research</i>: Understanding the target market, competitors, and potential users.</li>
                <li><i>Ideation & Concept Development</i>: Brainstorming and refining product ideas.</li>
                <li><i>Roadmapping</i>: Creating a detailed product roadmap to guide development.</li>
                <li><i>Feasibility Studies</i>: Assessing the product market fit before development begins</li>
              </ul>
            </p>
          </div>

          <div
            className="col-lg col-md-6 item bg-img"
            style={{ backgroundImage: "url(/img/arch/s1.jpg)" }}
          >
            <h6 className="numb">02</h6>
            <h5>User Experience (UX) Design</h5>
            <p>
            <ul>
                <li><i>User Research</i>: Conducting interviews, surveys, and usability tests to gather insights.</li>
                <li><i>Personas & User Journeys</i>: Developing user personas and mapping out user journeys.</li>
                <li><i>Wireframing</i>: Creating low-fidelity wireframes to outline the structure and flow.</li>
                <li><i>Prototyping</i>: Building interactive prototypes for testing and feedback.</li>
            </ul>
            </p>
          </div>

          <div
            className="col-lg col-md-6 item bg-img"
            style={{ backgroundImage: "url(/img/arch/s3.jpg)" }}
          >
            <h6 className="numb">03</h6>
            <h5>User Interface (UI) Design</h5>
            <p>
            <ul>
                <li><i>Visual Design</i>: Crafting the visual elements of the product, including typography, color schemes, and icons.</li>
                <li><i>Responsive Design</i>: Ensuring the product looks and functions well on various devices and screen sizes.</li>
                <li><i>Interaction Design</i>: Designing animations and transitions to enhance the user experience.</li>
                <li><i>Design Systems</i>: Creating a cohesive design language and components for consistency across the product.</li>
            </ul>
            </p>
          </div>

          <div
            className="col-lg col-md-6 item bg-img"
            style={{ backgroundImage: "url(/img/arch/s4.jpg)" }}
          >
            <h6 className="numb">04</h6>
            <h5>Software Development</h5>
            <p>
            <ul>
                <li><i>Front-End Development</i>: Building the user-facing part of the application using technologies like SwiftUI and RealityKit.</li>
                <li><i>Back-End Development</i>: Developing the server-side logic, databases, APIs, and services using technologies like Node.js, Python, Rust, Javascript, etc.</li>
                <li><i>Custom Software Development</i>: Developing tailored software solutions to meet specific business needs.</li>
            </ul>            
            </p>
          </div>

          <div
            className="col-lg col-md-6 item bg-img"
            style={{ backgroundImage: "url(/img/arch/s5.jpg)" }}
          >
            <h6 className="numb">05</h6>
            <h5>Quality Assurance & Testing</h5>
            <p>
            <ul>
                <li><i>Automated Testing</i>: Writing scripts to automate the testing process, ensuring that the software works as expected across different environments.</li>
                <li><i>Manual Testing</i>: Conducting manual tests to identify bugs, usability issues, and edge cases.</li>
                <li><i>Performance Testing</i>: Testing the product under various conditions to ensure it performs well under load.</li>
                <li><i>User Acceptance Testing (UAT)</i>: Involving end-users in the testing process to ensure the product meets their needs and expectations.
                </li>
            </ul>
            </p>
          </div>

          <div
            className="col-lg col-md-6 item bg-img"
            style={{ backgroundImage: "url(/img/arch/s5.jpg)" }}
          >
            <h6 className="numb">06</h6>
            <h5>Deployment & DevOps</h5>
            <p>
            <ul>
                <li><i>Continuous Integration/Continuous Deployment (CI/CD</i>: Implementing pipelines for automated testing, integration, and deployment.</li>
                <li><i>Cloud Hosting & Infrastructure</i>: Setting up and managing cloud services (e.g. iCloud, AWS, Google Cloud) to host the product.</li>
                <li><i>Security</i>: Implementing security best practices to protect the product and user data.</li>
            </ul>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Services6;
