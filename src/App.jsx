import { useEffect, useRef } from 'react'
import ThreeJSEnv from './components/threejs-env/threejs-env'
import './App.css'

function App() {
  // Use ref instead of state for direct DOM manipulation
  const cursorRef = useRef(null);
  
  useEffect(() => {
    if (!cursorRef.current) {
      // Create cursor element
      const cursor = document.createElement('div');
      cursor.className = 'custom-cursor';
      document.body.appendChild(cursor);
      cursorRef.current = cursor;
    }

    // Track cursor position with RAF and direct DOM manipulation
    const handleMouseMove = (e) => {
      requestAnimationFrame(() => {
        if (cursorRef.current) {
          cursorRef.current.style.left = `${e.clientX}px`;
          cursorRef.current.style.top = `${e.clientY}px`;
          cursorRef.current.style.display = 'block';
        }
      });
    };

    // Handle hover state
    const handleMouseOver = () => {
      if (cursorRef.current) {
        cursorRef.current.classList.add('hover');
      }
    };

    const handleMouseOut = () => {
      if (cursorRef.current) {
        cursorRef.current.classList.remove('hover');
      }
    };

    // Hide cursor when leaving window
    const handleMouseLeave = () => {
      if (cursorRef.current) {
        cursorRef.current.style.display = 'none';
      }
    };

    // Show cursor when entering window
    const handleMouseEnter = () => {
      if (cursorRef.current) {
        cursorRef.current.style.display = 'block';
      }
    };

    // Add event listeners
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseenter', handleMouseEnter);
    window.addEventListener('mouseleave', handleMouseLeave);
    
    // Add hover detection for interactive elements
    const interactiveElements = document.querySelectorAll('a, button, input, [role="button"]');
    interactiveElements.forEach(el => {
      el.addEventListener('mouseover', handleMouseOver);
      el.addEventListener('mouseout', handleMouseOut);
    });

    // Clean up
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseenter', handleMouseEnter);
      window.removeEventListener('mouseleave', handleMouseLeave);
      
      if (cursorRef.current) {
        document.body.removeChild(cursorRef.current);
      }
    };
  }, []);

  return (
    <>
      <ThreeJSEnv />
    </>
  );
}

export default App