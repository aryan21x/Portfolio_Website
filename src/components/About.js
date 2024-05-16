import React from "react";
import { Container, Row, Col} from "react-bootstrap";
import Profile from "../assets/img/ProfilePurple.jpg"

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
            <p>Redundant alt attribute. Screen-readers already announce `img` tags as an image. You don’t need to use the words `image`, `photo,` or `picture` (or any specified custom words) in the alt prop
              jsx-a11y/img-redundant-alt </p>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default About;
