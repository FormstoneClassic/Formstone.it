/*
Template: content
Title: Contributing
Description:
Order: 2
*/

# Contributing

Formstone components are all built with [Grunt](http://gruntjs.com/) and share a common automated process ensure code quality and maintain simple implementation. If you would like to contribute to a component, simply fork the specific project on [GitHub](http://www.github.com/), install grunt and start editing. Once you feel you have a working version, send us a pull request for review.

Changes should be made to component's source files (found in the <code>src/</code> directory) then built using Grunt to verify code quality and create production ready files. Once the update has been vetted, we'll merge the changes and push a newly tagged version. Easy as that.

### Using Grunt

Grunt is a javascript task runner installed and managed with [npm](https://npmjs.org/) via the command line, similar to Git. Learn more about getting started with Grunt at [gruntjs.com](http://gruntjs.com/getting-started).

After forking the component and cloning locally you will need to install Grunt and all other task dependencies. From the command line, navigate to the repository's directory and run the following two commands:

<pre class="example"><code>npm install grunt;
npm install;</code></pre>

Now you can jump into the code and start making changes. Once you've fixed a bug or added a feature, simply run the build process:

<pre class="example"><code>grunt;</code></pre>

If the build process completes without any errors you are ready to make a pull request. Keep in mind that new functionality should include a working demo and bug fixes should not not break any existing demos.