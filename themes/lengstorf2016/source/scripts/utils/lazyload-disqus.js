import { throttle } from './performance';
import { isElementVisible } from './is-in-viewport';

// jscs:disable requireCamelCaseOrUpperCaseIdentifiers

// Static value to keep track of whether or not the comments are loaded.
let isDisqusLoaded = false;
let disqus_config = false;

/**
 * Adds the Disqus comment script to the document.
 * @param  {String} shortName the short name for the Disqus account
 * @return {Void}
 */
const loadDisqus = shortName => {

  // Pulling this from the global namespace to allow CMS-generated values.
  disqus_config = window.disqus_config;

  // Create and append the Disqus loading script.
  const disqus = document.createElement('script');
  disqus.type = 'text/javascript';
  disqus.async = true;
  disqus.src = `//${shortName}.disqus.com/embed.js`;
  (document.body || document.head).appendChild(disqus);

  // Prevent duplicate loads.
  isDisqusLoaded = true;
};

function startLoad(shortName, container, containerClass) {
  container.classList.add(`${containerClass}--loading`);
  loadDisqus(shortName);
}

/**
 * Initializes the script and attaches a scroll handler.
 * @param  {String} options.shortName      the Disqus short name
 * @param  {String} options.containerClass the comment container's class
 * @return {Void}
 */
export function lazyLoadDisqus({ shortName, containerClass = 'comments' }) {
  const container = document.getElementsByClassName(containerClass)[0];
  const loadingClass = `${containerClass}--loading`;

  // Throttle the handler to avoid excessive checks.
  const shouldLoadDisqus = throttle(() => {
    if (container && !isDisqusLoaded && isElementVisible(container)) {
      startLoad(shortName, container, loadingClass);
    }
  }, 100);

  const loadOnClick = event => {
    if (
      event.target.classList.contains('js--load-disqus') &&
      event.target.getAttribute('href') === '#comments' &&
      container &&
      !isDisqusLoaded
    ) {
      startLoad(shortName, container, loadingClass);
    }
  };

  // Attach a listener to the scroll event.
  window.addEventListener('scroll', shouldLoadDisqus);
  document.addEventListener('click', loadOnClick);

  // In case the page was loaded with comments visible, fire once right away.
  shouldLoadDisqus();
}
