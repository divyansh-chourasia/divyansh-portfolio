import React from "react";
import {
  AiFillGithub,
  AiFillLinkedin,
  AiOutlineArrowUp,
} from "react-icons/ai";
import divIcon from "../assets/founder.png"


const Footer = () => {
  return (
    <footer>
      <div>
        <img
          src={divIcon}
          alt="Founder"
        />

        <h2>Divyansh Chourasia </h2>
        <p>Motivation is temporary, but discipline last forever.</p>
      </div>

      <aside>
        <h2>Social Media</h2>

        <article>
          <a href="https://www.linkedin.com/in/divyansh-chourasia-21903024a/" target={"blank"}>
            <AiFillLinkedin />
          </a>
          
          <a href="https://github.com/Divyansh1000" target={"blank"}>
            <AiFillGithub />
          </a>
        </article>
      </aside>
      <a href="#home">
        <AiOutlineArrowUp />
      </a>
    </footer>
  );
};

export default Footer;
