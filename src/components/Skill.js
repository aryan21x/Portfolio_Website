import Carousel from 'react-multi-carousel';
import 'react-multi-carousel/lib/styles.css';
import React from "../assets/img/React.png";
import C from "../assets/img/C++.png";
import Python from "../assets/img/python.png";
import SQL from "../assets/img/SQL.png";
import ASP from "../assets/img/c-sharp.png";
import Web from "../assets/img/js.png";
import Django from "../assets/img/Django.png";
import colorSharp from "../assets/img/color-sharp.png"
import { Container, Row, Col} from 'react-bootstrap';

const Skills = () => {
    const responsive = {
        superLargeDesktop: {
          breakpoint: { max: 4000, min: 3000 },
          items: 5
        },
        desktop: {
          breakpoint: { max: 3000, min: 1024 },
          items: 3
        },
        tablet: {
          breakpoint: { max: 1024, min: 464 },
          items: 2
        },
        mobile: {
          breakpoint: { max: 464, min: 0 },
          items: 1
        }
      };

    return (
        <section className="skill" id="skills">
        <Container>
            <Row>
                <Col>
                    <div className="skill-bx wow zoomIn">
                        <h2>Skills</h2>
                        <p>I can do both frontend and backend website Development.<br></br> Here are the skills and languages I'm proficient in.</p>
                        <Carousel responsive={responsive} infinite={true} className="owl-carousel owl-theme skill-slider">
                            <div className="item">
                                <img src={Web} alt="Image" />
                                <h5>Web Development</h5>
                            </div>
                            <div className="item">
                                <img src={React} alt="Image" />
                                <h5>React.js</h5>
                            </div>
                            <div className="item">
                                <img src={Django} alt="Image" />
                                <h5>Django</h5>
                            </div>
                            <div className="item">
                                <img src={ASP} alt="Image" />
                                <h5>ASP.net</h5>
                            </div>
                            <div className="item">
                                <img src={C} alt="Image" />
                                <h5>C++/C</h5>
                            </div>
                            <div className="item">
                                <img src={Python} alt="Image" />
                                <h5>Python</h5>
                            </div>
                            <div className="item recolor">
                                <img src={SQL} alt="Image" />
                                <h5>SQL</h5>
                            </div>
                        </Carousel>
                    </div>
                </Col>
            </Row>
        </Container>
        <img className="background-image-left" src={colorSharp} alt="Image" />
    </section>
    );
}


export default Skills;