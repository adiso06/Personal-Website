/**
 * Section-specific particles configuration
 * This applies particles to specific sections rather than the whole page
 */

// Check if particles.js is loaded properly
if (typeof particlesJS === 'function') {
  console.log("✅ particlesJS global function found at the beginning of section-particles.js");
} else {
  console.error("❌ particlesJS global function not found - this will cause initialization errors");
}

document.addEventListener("DOMContentLoaded", function() {
  console.log("DOM Content Loaded - checking for particles container");
  
  // Only initialize if the particles container exists
  const particlesContainer = document.getElementById('about-particles');
  if (particlesContainer) {
    console.log("Particles container found - initializing particles.js");
    
    // Create CSS fallback dots function
    const createCssParticles = () => {
      // Remove any existing fallback particles
      const existingFallback = document.getElementById('particles-fallback');
      if (existingFallback) {
        existingFallback.remove();
      }
      
      // Create fallback container
      const fallbackContainer = document.createElement('div');
      fallbackContainer.id = 'particles-fallback';
      fallbackContainer.style.position = 'absolute';
      fallbackContainer.style.top = '0';
      fallbackContainer.style.left = '0';
      fallbackContainer.style.width = '100%';
      fallbackContainer.style.height = '100%';
      fallbackContainer.style.overflow = 'hidden';
      fallbackContainer.style.zIndex = '0';
      
      // Create dots
      const dotCount = 15;
      for (let i = 0; i < dotCount; i++) {
        const dot = document.createElement('div');
        dot.className = 'particle-dot';
        dot.style.position = 'absolute';
        dot.style.width = (2 + Math.random() * 3) + 'px';
        dot.style.height = dot.style.width;
        dot.style.backgroundColor = 'rgba(51, 179, 141, 0.5)';
        dot.style.borderRadius = '50%';
        dot.style.top = Math.random() * 100 + '%';
        dot.style.left = Math.random() * 100 + '%';
        dot.style.opacity = 0.2 + Math.random() * 0.4;
        dot.style.animation = `floating ${8 + Math.random() * 15}s linear infinite`;
        dot.style.animationDelay = `-${Math.random() * 15}s`;
        
        fallbackContainer.appendChild(dot);
      }
      
      // Add keyframe animation with more subtle movements
      if (!document.getElementById('particle-keyframes')) {
        const styleSheet = document.createElement('style');
        styleSheet.id = 'particle-keyframes';
        styleSheet.textContent = `
          @keyframes floating {
            0% {
              transform: translate(0, 0);
            }
            25% {
              transform: translate(-5px, 5px);
            }
            50% {
              transform: translate(8px, 10px);
            }
            75% {
              transform: translate(-3px, -5px);
            }
            100% {
              transform: translate(0, 0);
            }
          }
        `;
        document.head.appendChild(styleSheet);
      }
      
      // Add fallback to container
      particlesContainer.appendChild(fallbackContainer);
      console.log("CSS fallback particles created");
      return fallbackContainer;
    };
    
    // Add CSS fallback in case particles.js fails
    try {
      // Try to initialize particles.js
      try {
        // Initialize particles with comprehensive configuration
        particlesJS('about-particles', {
          "particles": {
            "number": {
              "value": 60,
              "density": {
                "enable": true,
                "value_area": 900
              }
            },
            "color": {
              "value": "#33b38d" // Brand green color
            },
            "shape": {
              "type": "circle",
              "stroke": {
                "width": 0,
                "color": "#000000"
              },
              "polygon": {
                "nb_sides": 5
              }
            },
            "opacity": {
              "value": 0.5,
              "random": false,
              "anim": {
                "enable": true,
                "speed": 0.3,
                "opacity_min": 0.3,
                "sync": false
              }
            },
            "size": {
              "value": 3,
              "random": true,
              "anim": {
                "enable": true,
                "speed": 1,
                "size_min": 1,
                "sync": false
              }
            },
            "line_linked": {
              "enable": true,
              "distance": 150,
              "color": "#33b38d",
              "opacity": 0.3,
              "width": 1
            },
            "move": {
              "enable": true,
              "speed": 0.8,
              "direction": "none",
              "random": true,
              "straight": false,
              "out_mode": "bounce",
              "bounce": true,
              "attract": {
                "enable": true,
                "rotateX": 300,
                "rotateY": 600
              }
            }
          },
          "interactivity": {
            "detect_on": "canvas",
            "events": {
              "onhover": {
                "enable": true,
                "mode": ["grab", "bubble"]
              },
              "onclick": {
                "enable": true,
                "mode": ["push", "repulse"]
              },
              "resize": true
            },
            "modes": {
              "grab": {
                "distance": 180,
                "line_linked": {
                  "opacity": 0.8
                }
              },
              "bubble": {
                "distance": 250,
                "size": 8,
                "duration": 1.5,
                "opacity": 0.6,
                "speed": 0.8
              },
              "repulse": {
                "distance": 120,
                "duration": 1.2
              },
              "push": {
                "particles_nb": 4
              },
              "remove": {
                "particles_nb": 2
              }
            }
          },
          "retina_detect": true
        });
      } catch (error) {
        console.error("Error initializing particles.js:", error);
        console.log("Falling back to CSS-based particles");
        createCssParticles();
      }
      
    } catch (e) {
      console.error("Cannot initialize particles, fallback failed:", e);
    }

    // Handle theme changes - recreate particles on theme change for simplicity
    const updateParticleColors = () => {
      try {
        console.log("Theme changed - updating particles");
        
        // Check if we're using fallback or particles.js
        const fallbackContainer = document.getElementById('particles-fallback');
        
        if (fallbackContainer) {
          // Using CSS fallback, just update the dot colors
          const dots = fallbackContainer.querySelectorAll('.particle-dot');
          dots.forEach(dot => {
            dot.style.backgroundColor = 'rgba(51, 179, 141, 0.5)';
          });
        } else if (window.pJSDom && window.pJSDom.length > 0) {
          // Try to update particles.js
          try {
            // Destroy existing particles
            window.pJSDom[0].pJS.fn.vendors.destroypJS();
            window.pJSDom = [];
            
            // Small timeout to ensure DOM is ready after theme change
            setTimeout(() => {
              // Reinitialize particles with the same comprehensive config
              if (document.getElementById('about-particles')) {
                particlesJS('about-particles', {
                  "particles": {
                    "number": {
                      "value": 40,
                      "density": {
                        "enable": true,
                        "value_area": 900
                      }
                    },
                    "color": {
                      "value": "#33b38d"
                    },
                    "shape": {
                      "type": "circle",
                      "stroke": {
                        "width": 0,
                        "color": "#000000"
                      },
                      "polygon": {
                        "nb_sides": 5
                      }
                    },
                    "opacity": {
                      "value": 0.5,
                      "random": false,
                      "anim": {
                        "enable": true,
                        "speed": 0.3,
                        "opacity_min": 0.3,
                        "sync": false
                      }
                    },
                    "size": {
                      "value": 3,
                      "random": true,
                      "anim": {
                        "enable": true,
                        "speed": 1,
                        "size_min": 1,
                        "sync": false
                      }
                    },
                    "line_linked": {
                      "enable": true,
                      "distance": 150,
                      "color": "#33b38d",
                      "opacity": 0.3,
                      "width": 1
                    },
                    "move": {
                      "enable": true,
                      "speed": 0.8,
                      "direction": "none",
                      "random": true,
                      "straight": false,
                      "out_mode": "bounce",
                      "bounce": true,
                      "attract": {
                        "enable": true,
                        "rotateX": 300,
                        "rotateY": 600
                      }
                    }
                  },
                  "interactivity": {
                    "detect_on": "canvas",
                    "events": {
                      "onhover": {
                        "enable": true,
                        "mode": ["grab", "bubble"]
                      },
                      "onclick": {
                        "enable": true,
                        "mode": ["push", "repulse"]
                      },
                      "resize": true
                    },
                    "modes": {
                      "grab": {
                        "distance": 180,
                        "line_linked": {
                          "opacity": 0.6
                        }
                      },
                      "bubble": {
                        "distance": 250,
                        "size": 8,
                        "duration": 1.5,
                        "opacity": 0.6,
                        "speed": 0.8
                      },
                      "repulse": {
                        "distance": 120,
                        "duration": 1.2
                      },
                      "push": {
                        "particles_nb": 4
                      },
                      "remove": {
                        "particles_nb": 2
                      }
                    }
                  },
                  "retina_detect": true
                });
              }
            }, 100);
          } catch (error) {
            console.error("Error recreating particles.js:", error);
            // If particles.js failed, create CSS fallback
            createCssParticles();
          }
        }
      } catch (error) {
        console.error("Error updating particles:", error);
      }
    };

    // Listen for theme toggle clicks
    document.querySelector('.js-dark-toggle')?.addEventListener('click', function() {
      // Wait a bit for the theme to change
      setTimeout(updateParticleColors, 50);
    });
    
    // Initial color setup
    updateParticleColors();
  }
}); 