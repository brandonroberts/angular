# Getting Started with Angular: Your First App

Angular is the modern web developer's platform. 
Angular gives you the tools and the ecosystem to build web applications that scale. 
Angular provides advanced capabilities for internationalization, mobile apps, server-side rendering, and more, so that you can deliver more quickly, with less risk. 

In this tutorial, we'll introduce you to the building blocks of Angular. We'll leverage what you already know about web development, and teach you the essentials of Angular so you can feel confident exploring Angular's extensive native capabilities and [network of 3rd-party tools and libraries](https://angular.io/resources). 



## Introduction

This tutorial walks you through the steps to build a simple online store application. The application displays a catalog of products and their details. It also includes a shopping cart, with check out functionality. 


<figure>
  <img src='generated/images/guide/toh/component-structure.gif' alt="Angular applications are broken down into a tree of components like on express.google.com">
</figure>


*JAF: Min: Replace image with one that is just the app without component overlays, fix sizing. Consider: Replace with final GS Store app*


{@a intro-tutorial}
### What you'll learn
<!-- Tutorial application -->

The store app is simplified to help you focus on skills that you are most likely to use in developing your own apps. The techniques that you will learn are Angular best practices, intended to scale with your Angular apps. 

This tutorial is organized into three parts:

* Part 1 - Your First App (1.5 hours): You'll create the catalog of products. You'll learn about:

    - Components, which are the building blocks of an Angular application
    - Angular's template syntax, which extends HTML to provide integration with data and services
    - How to use services to deliver data to components
    - How to use routing to synchronize URL changes and app changes in response to user actions 

* Part 2 - Managing Data (2 hours): You'll add the shopping cart and checkout features. You'll learn about: 

    - Retrieving data via an HTTP interface
    - Using forms to manage user interactions with data

* Part 3 - Deployment: You'll deploy your app to a live website (Firebase) or to your hosting environment. If you chose to deploy to your hosting environment, you'll learn how to use the [Angular CLI](cli) to build and deploy your app to the hosting environment of your choice. 

Within each section, this tutorial introduces a new concept and then provides instructions to apply that concept to the online store app. 

You can also see the <live-example noDownload></live-example>

*JAF: Verify and update time estimates for each part.*


{@a intro-skills}
### Prerequisites


To get the most benefit from Angular and this tutorial, we recommend that you have experience in the following areas: 

* Basic programming
* HTML, CSS, and JavaScript or TypeScript


<div class="alert is-helpful">

If you are new to web development, you'll find lots of resources available to compliment the Angular docs. Mozilla's MDN docs include both [HTML](https://developer.mozilla.org/en-US/docs/Learn/HTML) and [JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript) introductions. [TypeScript's docs] (https://www.typescriptlang.org/docs/home.html) include a 5-minute tutorial. Various online course platforms, such as Udemy and CodeAcademy, also cover web development basics. 

</div> 

{@a stackblitz}
### Setup

You don't need to install anything. You'll build the shopping cart using [StackBlitz](https://stackblitz.com/). StackBlitz is an online development environment with accelerators that make it easy to develop an Angular application. The accelerators are similar to what is offered by the [Angular CLI](cli) when you are working locally. 


{@a components}
## Key concepts




{@a components}
### Components

Components are the building blocks of Angular apps. 
A component is comprised of three things: 

* An HTML template, which determines what is presented to the user 
* A class that handles data and functionality 
* Styles that define the look and feel 

This structure provides a consistent way to combine and present HTML, CSS, and Javascript on a page. 
Angular components behave similarly to HTML elements, and they can be given state or generate events.

An Angular application is composed of a tree of components, in which each Angular component has a specific purpose and responsibility. 
The components at each level of the tree have progressively fewer responsibilities. 

Imagine a typical shopping experience, such as [Google Express](https://express.google.com): 

*JAF: Use the shopping cart that we'll build. Fix size.*

<figure>
  <img src='generated/images/guide/toh/component-structure.png' alt="Angular applications are broken down into a tree of components like on express.google.com">
</figure>

We can organize this app into the following tree of components:

* app-root: The first component to load, the parent of all other components. You can think of this as the overall page or app shell. 
  * app-top-bar: Top bar, with branding and site-wide controls
  * app-side-nav: Side navigation, which includes the list of product categories 
  * app-product-list: Product list 
    * app-product-carousel): Product carousel, which displays a rotating series of highlighted products
    * app-product-preview: Product preview, with basic information such as name and description
    * app-product-preview: Product preview
    * app-product-preview: Product preview
    * app-product-preview: Product preview
    
Just like HTML elements, components can be referred to or nested in another component's template. A component is referred to by its `selector`. The selector is the name you give the Angular component when it is rendered as an HTML element on the page. By convention, Angular component selectors begin with the prefix such as `app-`, followed by the component name. 


{@a template-syntax}
### Template syntax

Angular extends and builds on top of HTML. Angular provides template syntax that gives components control over the display of content. 

This section introduces five of the things you can do within an Angular template to affect what your user sees, based on the component's state and behavior. You'll use these throughout this tutorial. 

Experiment by playing with different values in the input boxes below. 

#### {{ }} Interpolation

Interpolation lets you render the contents of a property of a component as text in HTML. 

<aio-gs-interpolation></aio-gs-interpolation>

#### [ ] Property binding

Following the mental model of HTML, components have state being given to them. This is accomplished by binding to the property of a component or HTML element.

You can bind to a property on an element, so that whenever the property changes, the element is updated based on the template expression.

<aio-gs-property-binding></aio-gs-property-binding>

#### ( ) Event binding

You can listen to standard HTML events or custom events (which you create through components). 

<aio-gs-event-binding></aio-gs-event-binding>

#### *ngIf

You can add and remove elements from the page dynamically using `*ngIf`. 

`*ngIf` is a "structural directive". Structural directives change which HTML or components are displayed.  Technically, they shape or reshape the DOM's structure, typically by adding, removing, and manipulating the elements to which they are attached. Any directive with an * is a structural directive.

<aio-gs-ng-if></aio-gs-ng-if>

#### *ngFor

*ngFor is another structural directive. It iterates over a list, rendering the HTML or component once for each item in the list. 

<aio-gs-ng-for></aio-gs-ng-for>


<div class="alert is-helpful">

To learn about the full capabilities of Angular's template syntax, see the [Template Syntax guide](guide/template-syntax).

</div>


{@a basic-app}
## Building the basic store app layout
<!-- skeleton, framework, site layout, app layout -->

Let's get started. 

In this section, you'll create a new project in StackBlitz, and then scaffold out some components for your store. 


#### 1. Create a new project
<!-- does this def of project match local def? when and how do we introduce workspace? -->
<!-- 
You develop apps in the context of an Angular workspace. A workspace contains the files for one or more projects. A project is the set of files that comprise an app, a library, or end-to-end (e2e) tests.  -->

To create a new project in StackBlitz, [click here](https://stackblitz.com/fork/ng-getting-started-ed34c9).

StackBlitz creates a new Angular workspace and an initial app project. The initial app includes the `app-root` component mentioned above, as well as other app and configuration files. The `app-root` component is responsible for displaying "Angular Getting Started" in the preview pane on the right. 

Tips for working in Stackblitz:
* If you log into StackBlitz, you can easily take breaks and return to the current state of this tutorial app. If you have a GitHub account, you can log into StackBlitz with that account. See [Working in Stackblitz](#stackblitz) for more tips. 
* If you want to save a snapshot of your work at a given point, create a fork. You can edit the name of your Stackblitz project to make it easier to return to your work (such as `getting-started-part1`). To display all of your forks, click on your name in the top bar. 
* If the preview pane isn't showing what you expect, save and then click the refresh button. 
* To copy a code example from this tutorial, click the icon at the top right of the code example box to save the example to the clipboard. Then you can paste the code snippet into Stackblitz. 

### Learning Template Syntax

1. Look at the product-list.component.ts file
1. Note the “products” data defined in the component
1. Look at the initial product list component HTML. This is what we’ll use for showing template syntax

<code-example header="src/app/product-list/product-list.component.html" path="getting-started-v2/src/app/product-list/product-list.component.1.html">
</code-example>

1. Add *ngFor directive to the div to iterate over each item and display them
1. Inside the anchor element, use interpolation to display the product name
1. On the anchor element, use a property binding bind the title attribute to the product name

<code-example header="src/app/product-list/product-list.component.html" path="getting-started-v2/src/app/product-list/product-list.component.2.html">
</code-example>

1. On the paragraph tag, use an *ngIf directive to show the element if it has a description
1. Use interpolation to show the description inside the paragraph tag

<code-example header="src/app/product-list/product-list.component.html" path="getting-started-v2/src/app/product-list/product-list.component.3.html">
</code-example>

1. Add a button element to the HTML
1. Add an event binding for a `click` event to call the `share()` method defined in the component TS file.
1. Bind the click event to the addToCart() method in the TS file

<code-example header="src/app/product-list/product-list.component.html" path="getting-started-v2/src/app/product-list/product-list.component.4.html">
</code-example>

Now when you click the button you see an alert

## Success Point

### Inputs/Outputs

1. Generate product details component

Import

1. Import `Input`, `Output`, `EventEmitter` from the `@angular/core` package.

<code-example header="src/app/product-details/product-details.component.ts" path="getting-started-v2/src/app/product-details/product-details.component.1.ts" region="imports">
</code-example>

Define Properties

1. Define a property named `product` in the product-details.component class with an `Input` decorator
1. Define an output property named `share` with an `Output` decorator and an instance of `EventEmitter`

<code-example header="src/app/product-details/product-details.component.ts" path="getting-started-v2/src/app/product-details/product-details.component.1.ts" region="input-output">
</code-example>

Update Template

1. Update the template with similar interpolation for product name, price, and description
1. Add share button to the template with a event binding to call the `share.emit()` method

<code-example header="src/app/product-details/product-details.component.ts" path="getting-started-v2/src/app/product-details/product-details.component.1.html" region="input-output">
</code-example>

### Product List to Product Details

1. Add a `selectedProduct` property to the product list component TS
1. Add a method named `selectProduct()` to the component TS that sets the `selectedProduct` property with the provided product

<code-example header="src/app/product-list/product-list.component.ts" path="getting-started-v2/src/app/product-list/product-list.component.ts" region="product">
</code-example>

1. In the template, add an event binding to the anchor element to call selectProduct(product)
1. Add product details component to bottom of the product-list component
1. Use an *ngIf on the product details component for a product
1. Use a property binding to pass the product property to the product details component
1. Add an event listener for the “share” event from the component that calls the same `share()` method

<code-example header="src/app/product-list/product-list.component.html" path="getting-started-v2/src/app/product-list/product-list.component.5.html">
</code-example>

## Success Point

## Page 2

## Routing

### A link to product details route

1. Replace click event binding with routerLink to Product List template on the anchor tag
1. Remove share button and product details component from product list template

<code-example header="src/app/product-list/product-list.component.html" path="getting-started-v2/src/app/product-list/product-list.component.html">
</code-example>

1. In the product details component template, update template to wrap product details information with an `*ngIf`.

<code-example header="src/app/product-details/product-details.component.html" path="getting-started-v2/src/app/product-details/product-details.component.1.html">
</code-example>

1. Add a route in the AppModule for product details, with a `path` of `products/:productId` and `ProductDetailsComponent` for the `component`.

<code-example header="src/app/app.module.ts" path="getting-started-v2/src/app/app.module.ts" region="product-details-route">
</code-example>

Click on each product and route to the product details

No product details information is shown yet

## Success Point

