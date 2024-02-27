import React from 'react';
import { useSpring, animated } from 'react-spring';
import './Text.scss'
const Texto = () => {
  // Define la animación usando useSpring
  const props = useSpring({
    to: { opacity: 1 },
    from: { opacity: 0 },
    config: { duration: 1000 },
  });

  return (
      <div className='containerText'>
        <animated.div style={props}>
          <h1>Bienvenido...</h1>
          <h2>Por favor selecciona una categoría</h2>
        </animated.div>
      </div>
  );
};

export default Texto;
