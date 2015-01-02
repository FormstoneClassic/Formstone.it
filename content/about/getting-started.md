/*
Template: content
Title: Getting Started
Description:
Order: 1
*/

# Getting Started

Formstone components are designed to be implemented easily without impacting your existing project. Scripts are wrapped in self-executing closures and styles are individually name spaced to avoid collisions.

### Deploy

The first step is to deploy the package, either by downloading the package from [GitHub](https://github.com/Formstone/Formstone) or using [Bower](http://bower.io/), a front-end package manager. All Formstone components can be deployed and updated via the command line with Bower:

<pre class="example"><code>bower install ComponentName</code></pre>

Note: Bower will install components in a <code>bower-components</code> directory by default. We suggest setting a more URL-friendly directory in the <code>.bowerrc</code> file:

<pre class="example"><code>{
	"directory": "components"
}</code></pre>

### Implement

Once deployed, components can be implemented by including the files directly or hooking into your current build scripts:

<pre class="example"><code class="language-markup">&lt;link href="/components/Component/jquery.fs.component.css" rel="stylesheet" type="text/css" media="all" /&gt;
&lt;script src="/components/Component/jquery.fs.component.js"&gt;&lt;/script&gt;</code></pre>

### Customize

When customizing any component, best practice is to deploy the production files as provided then implement and extend the component's properties in your local scripts and styles. This ensures the ability to update any component without overwriting custom styles.

### Contribute

Find a bug? Have an idea for new functionality? You should check out [Contributing to Formstone](http://formstone.it/about/contributing).
