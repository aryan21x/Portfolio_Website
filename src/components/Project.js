import { Container, Row, Col, Tab, Nav } from "react-bootstrap";
import { ProjectCard } from "./ProjectCard";
import EliteRecruit from "../assets/img/EliteRecruit.png";
import PetAdoption from "../assets/img/PetAdoption.png";
import Learning from "../assets/img/LearningLog.png";

import Editor from "../assets/img/editor.jpg"
import Knight from "../assets/img/knight.jpg"
import Cards from "../assets/img/cards.jpg"

import Pixel from "../assets/img/pixels.jpg"

import colorSharp2 from "../assets/img/color-sharp2.png";
import 'animate.css'
import TrackVisibility from "react-on-screen";



const Project = () => {

    const projects = [
        {
          title: "EliteRecruit (ASP.net)",
          description: "A team project that developed a website based on the MVC ASP.NET Core framework that facilitates recruiters in browsing a list of students for potential recruitment. The website allows recruiters to perform CRUD, sort, and filter operations on the students. The website uses the Bootstrap framework for its design.",
          imgUrl: EliteRecruit,
          Github: "https://github.com/aryan21x/Recruting-Website",
        },
        {
          title: "Pet Adoption (Django,SQL)",
          description: "Pet adoption website made by a team of two, powered by Django framework which is integrated with MySQL Workbench for handling the database operations. It has six interconnected tables for Pets, Shelters, Workers, Vets, Adopters, and Businesses. Admins can perform CRUD, sort, and filter operations on each of these tables.",
          imgUrl: PetAdoption,
          Github: "https://github.com/aryan21x/PetAdoption-website",
        },
        {
          title: "Learning Log(Django)",
          description: "This web application provides users with the ability to maintain a journal of things they are actively learning. Users can easily set up an account by choosing a username and password. Once logged in, they can effortlessly create new topics and journal entries to document their learning experiences. This project is developed using the Django package of Python.",
          imgUrl: Learning,
          Github: "https://github.com/aryan21x/Learning_log",
        },
      ];

      const projects2 = [
        {
          title: "Image Manipulation",
          description: "Developed image manipulation program in C++ for processing PPM images with dynamic memory allocation, offering user-friendly options including X-axis and Y-axis flips, clockwise and counter-clockwise rotations, and sepia and grayscale conversions. Provided user flexibility to choose between binary and ASCII output formats for manipulated images.",
          imgUrl: Editor,
          Github: "https://github.com/aryan21x/Image-Manipulation",
        },
        {
          title: "The Knight's Tour",
          description: "Designed and implemented a recursive brute-force algorithm in C++ to solve the Knight's Tour problem on an n x n chessboard, with 'n' provided by user input. Developed a program that guides a knight to visit every square on the chessboard exactly once, and outputs a complete solution on the screen.",
          imgUrl: Knight,
          Github: "https://github.com/aryan21x/The-Knights-Tour",
        },
        {
          title: "Game of War",
          description: "The program imitates the classic card game 'War' and leverages the STL stack and queue templates to facilitate its execution. It offers two distinct launch options, each providing a unique gameplay experience. In one mode, the program generates a deck of 52 cards for each player using a random card generator, while in the other mode, it uses external files as input sources to populate each player's card queue.",
          imgUrl: Cards,
          Github: "https://github.com/aryan21x/Game-of-War",
        },
      ];

      const projects3 = [
        {
          title: "Printing PPM Images to Terminal(ARM Assembly)",
          description: "The following project prints PPM images on the terminal. The project is built using Assembly and C. The input is an image in PPM form and the output is a black and white Image on the terminal which is displayed using ASCII characters.",
          imgUrl: Pixel,
          Github: "https://github.com/aryan21x/Printing-PPM-Image-on-Terminal",
        },
      ];

    return (
        <section className="project" id="projects">
      <Container>
        <Row>
          <Col size={12}>
                <h2>Projects</h2>
                <p>I have classified my projects into three types: Websites, C++ Applications, and Other.</p>
                <Tab.Container id="projects-tabs" defaultActiveKey="first">
                  <Nav variant="pills" className="nav-pills mb-5 justify-content-center align-items-center" id="pills-tab">
                    <Nav.Item>
                      <Nav.Link eventKey="first">Websites</Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                      <Nav.Link eventKey="second">C++ Apps</Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                      <Nav.Link eventKey="third">Other</Nav.Link>
                    </Nav.Item>
                  </Nav>
                  <TrackVisibility partialVisibility>
                { ({isVisible}) =>
                  <Tab.Content>
                    <Tab.Pane eventKey="first" className={isVisible? "animate__animated animate__fadeInUp": ""}>
                      <Row>
                        {
                          projects.map((project, index) => {
                            return (
                              <ProjectCard
                                key={index}
                                {...project}
                                />
                            )
                          })
                        }
                      </Row>
                    </Tab.Pane>
                    <Tab.Pane eventKey="second" className={isVisible? "animate__animated animate__fadeInUp": ""}>
                    <Row>
                        {
                          projects2.map((project, index) => {
                            return (
                              <ProjectCard
                                key={index}
                                {...project}
                                />
                            )
                          })
                        }
                      </Row>
                    </Tab.Pane>
                    <Tab.Pane eventKey="third" className={isVisible? "animate__animated animate__fadeInUp": ""}>
                    <Row>
                        {
                          projects3.map((project, index) => {
                            return (
                              <ProjectCard
                                key={index}
                                {...project}
                                />
                            )
                          })
                        }
                      </Row>
                    </Tab.Pane>
                  </Tab.Content>
                  }
                  </TrackVisibility>
                </Tab.Container>
          </Col>
        </Row>
      </Container>
      <img className="background-image-right" src={colorSharp2} alt="projectBg"></img>
    </section>
    );
}

export default Project;