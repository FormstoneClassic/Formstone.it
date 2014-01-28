/*
Template: content
Title: Contributing
Description:
Order: 2
*/

# Contributing

Formstone components are built with [Grunt](http://gruntjs.com/) and share a common set of automated tasks that ensure code quality and maintain simple implementation. If you would like to contribute to a component, simply fork the specific project on [GitHub](http://www.github.com/), install grunt and start editing. Once you feel you have a working version, send us a pull request. After we have reviewed your updates we'll merge the changes and push a newly tagged version. Easy as that.

### Using Grunt

Grunt is a javascript task runner installed and managed with [npm](https://npmjs.org/) via the command line, similar to Git. Learn more about getting started with Grunt at [gruntjs.com](http://gruntjs.com/getting-started).

After forking the component and cloning locally you will need to install Grunt and all other task dependencies. From the command line, navigate to the repository's directory and run the following commands:

<pre class="example"><code>npm install grunt;
npm install;</code></pre>

Now you can jump into the code and start making changes. Once you've fixed a bug or added a feature, simply run the build process:

<pre class="example"><code>grunt;</code></pre>

If the build process completes without any errors that you are ready to make a pull request. Keep in mind that new functionality should include a working demo and bug fixes should not not break any existing demos.