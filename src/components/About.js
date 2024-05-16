import React from "react";
import { Container, Row, Col} from "react-bootstrap";
import Profile from "../assets/img/ProfilePurple.jpg"
import Resume from "../assets/resume/ResumeTemp.pdf";

const About = () => {
  return (
    <section className="about" id="about">
      <Container>
        <Row>
          <Col>
            <img src={Profile} alt="profileImage" className="aboutBox" />
          </Col>
          <Col className="align-items-center">
            <h1>Aryan Raval</h1>
            <p>A bit About me</p>
            <p className="SecondPara">
            I am a Computer Science major at South Dakota School of Mines. I am a junior, expected to graduate in 2026. 
            I can do both frontend and backend web development. I specialize in Artificial Intelligence and Machine Learning. Feel free to contact me.
            </p>
            <a href={Resume} target="_blank" rel="noopener noreferrer" className="resume-link"> Resume </a>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default About;
