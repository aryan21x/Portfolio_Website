import { Container, Row, Col, Tab, Nav } from "react-bootstrap";
import { ProjectCard } from "./ProjectCard";
import EliteRecruit from "../assets/img/EliteRecruit.png";
import PetAdoption from "../assets/img/PetAdoption.png";
import Learning from "../assets/img/LearningLog.png";
import colorSharp2 from "../assets/img/color-sharp2.png";

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
                  <Tab.Content>
                    <Tab.Pane eventKey="first">
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
                    <Tab.Pane eventKey="second">
                    </Tab.Pane>
                    <Tab.Pane eventKey="third">
                    </Tab.Pane>
                  </Tab.Content>
                </Tab.Container>
          </Col>
        </Row>
      </Container>
      <img className="background-image-right" src={colorSharp2} alt="projectBg"></img>
    </section>
    );
}

export default Project;