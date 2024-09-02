import React from "react";
import { Link } from 'gatsby';

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
                <li>Market Research: Understanding the target market, competitors, and potential users.</li>
                <li>Ideation & Concept Development: Brainstorming and refining product ideas.</li>
                <li>Roadmapping: Creating a detailed product roadmap to guide development.</li>
                <li>Feasibility Studies: Assessing the product market fit before development begins</li>
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
                <li>User Research: Conducting interviews, surveys, and usability tests to gather insights.</li>
                <li>Personas & User Journeys: Developing user personas and mapping out user journeys.</li>
                <li>Wireframing: Creating low-fidelity wireframes to outline the structure and flow.</li>
                <li>Prototyping: Building interactive prototypes for testing and feedback.</li>
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
                <li>Visual Design: Crafting the visual elements of the product, including typography, color schemes, and icons.</li>
                <li>Responsive Design: Ensuring the product looks and functions well on various devices and screen sizes.</li>
                <li>Interaction Design: Designing animations and transitions to enhance the user experience.</li>
                <li>Design Systems: Creating a cohesive design language and components for consistency across the product.</li>
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
                <li>Apple ecosystem Front-End Development: Building the user-facing part of the application using technologies like SwiftUI and RealityKit.</li>
                <li>Back-End Development: Developing the server-side logic, databases, APIs, and services using technologies like Node.js, Python, Rust, Javascript, etc.</li>
                <li>Custom Software Development: Developing tailored software solutions to meet specific business needs.</li>
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
                <li>Automated Testing: Writing scripts to automate the testing process, ensuring that the software works as expected across different environments.</li>
                <li>Manual Testing: Conducting manual tests to identify bugs, usability issues, and edge cases.</li>
                <li>Performance Testing: Testing the product under various conditions to ensure it performs well under load.</li>
                <li>User Acceptance Testing (UAT): Involving end-users in the testing process to ensure the product meets their needs and expectations.
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
                <li>Continuous Integration/Continuous Deployment (CI/CD): Implementing pipelines for automated testing, integration, and deployment.</li>
                <li>Cloud Hosting & Infrastructure: Setting up and managing cloud services (e.g. iCloud, AWS, Google Cloud) to host the product.</li>
                <li>Security: Implementing security best practices to protect the product and user data.</li>
            </ul>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Services6;
