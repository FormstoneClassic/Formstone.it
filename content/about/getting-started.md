/*
Template: content
Title: Getting Started
Description:
Order: 1
*/

# Getting Started

Formstone components are designed to be implemented with as little impact on your existing project as possible. Scripts are wrapped in self-executing closures and styles are individually namespaced to avoid collisions.

### Deploy

The first step is to deploy the package, either by downloading the package from [GitHub](http://www.github.com/) or using [Bower](http://bower.io/), a front-end package manager. All Formstone components can be deployed and updated via the command line with Bower:

<pre class="example"><code>bower install ComponentName</code></pre>

Note: Bower will install components in a <code>bower-components</code> directory by default. We suggest setting a more URL-friendly directory in the <code>.bowerrc</code> file:

<pre class="example"><code>{
	"directory": "components"
}</code></pre>

### Implement

Once installed, components can be implemented by including the files directly or hooking into your current build scripts:

<pre class="example"><code class="language-markup">&lt;link href="/components/ComponentName/jquery.fs.component.css" rel="stylesheet" type="text/css" media="all" /&gt;
&lt;script src="/components/ComponentName/jquery.fs.component.js"&gt;&lt;/script&gt;</code></pre>

### Customize

When customizing any component, best practice is to include the production files as provided then implement and extend the component's properties in your local scripts and styles. This ensures the ability to update any component without overwriting custom styles.

### Contribute

Find a bug? Have an idea for new functionality? You should check out [Contributing to Formstone](http://localhost:8888/formstone/about/contributing).