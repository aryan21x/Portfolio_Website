import { useState, useEffect} from "react";
import {Container, Row, Col} from "react-bootstrap";
import { ArrowRightCircle } from "react-bootstrap-icons";
import headerImg from "../assets/img/Butterfly.png";
import 'animate.css'
import TrackVisibility from "react-on-screen";

const Banner = () => {
    const [loopNum, setLoopNum] = useState(0);
    const [isDeleting, setIsDeleting] = useState(false);
    const toRotate = ["Web Developer", "Software Engineer", "Programmer"];
    const [text, setText] = useState('');
    const [delta, setDelta] = useState(300 - Math.random() * 100);
    const period = 2000;

    const tick = () => {
        let i = loopNum % toRotate.length;
        let fullText = toRotate[i];
        let updatedText = isDeleting ? fullText.substring(0, text.length - 1) : fullText.substring(0, text.length + 1);
        
        setText(updatedText);

        if (isDeleting) {
            setDelta(prevDelta => prevDelta / 2)
        }

        if ( !isDeleting && updatedText === fullText){
            setIsDeleting(true);
            setDelta(period);
        }   else if (isDeleting && updatedText === '') {
            setIsDeleting(false);
            setLoopNum(loopNum + 1);
            setDelta(500);
        }
    }

    useEffect ( () =>{
        let ticker = setInterval ( () => {
            tick();
        }, delta)

        return () => { clearInterval(ticker)};
        // eslint-disable-next-line react-hooks/exhaustive-deps
    } , [text])


    return (
        <section className="banner" id="home">
            <Container>
                <TrackVisibility partialVisibility>
                { ({isVisible}) =>
                <div className={isVisible? "animate__animated animate__slideInUp": ""}>
                    <Row className="align-items-center">
                        <Col xs={12} md={6} xl={7}>
                            <span className="tagline"> Welcome to my Portfolio</span>
                            <h1>{`Hi I'm Aryan Raval a `}<span className="wrap">{text}</span></h1>
                            <p> Always ready to learn.</p>
                            <a href="#about" className="BannerBtn">Learn more about me <ArrowRightCircle size={25} /></a>
                        </Col>
                        <Col xs={12} md={6} xl={5}>
                            <img src={headerImg} alt="Header Img" />
                        </Col>
                    </Row>
                </div>}
                </TrackVisibility>
            </Container>
        </section>
    );
}


export default Banner;