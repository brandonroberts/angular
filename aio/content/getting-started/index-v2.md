# Getting Started with Angular: Your First App

Welcome to Angular! 

Angular makes it easy to build modern applications for the web, mobile, or desktop. 
Angular leverages what you already know to accelerate development in HTML and JavaScript (or TypeScript). 
Angular's extensive [native capabilities](api) and robust [ecosystem](https://angular.io/resources) deliver the productivity and scalable infrastructure that supports Google's largest applications.

<!-- 
Angular's extensive [native capabilities](api) and robust [ecosystem](https://angular.io/resources) enable you to deliver more quickly, with less risk. 

Angular's extensive native capabilities and robust [network of 3rd-party tools and libraries](https://angular.io/resources) enable you to deliver more quickly, with less risk. 

Angular's extensive and robust [ecosystem](https://angular.io/resources) enables you to leverage the power of community to deliver more quickly, with less risk.*

Angular is a platform that makes it easy to build modern applications for the web, mobile, or desktop. 

Angular is a framework for building client applications in HTML and either JavaScript or a language like TypeScript that compiles to JavaScript.

Angular is a platform and framework for building client applications in HTML and TypeScript. 

Angular is written in TypeScript. 
It implements core and optional functionality as a set of TypeScript libraries that you import into your apps.

Angular gives you the tools and the ecosystem to build web applications that scale. 
It provides advanced capabilities for internationalization, mobile apps, server-side rendering, and more, so that you can deliver more quickly, with less risk. 

popular web framework

extensible and robust ecosystem

fast, robust, scalable 

Angular delivers the productivity and scalable infrastructure that supports Google's largest applications. 

From prototype through global deployment, Angular delivers the productivity and scalable infrastructure that supports Google's largest applications.


You write Angular applications by composing HTML templates with Angularized markup, writing component classes to manage those templates, adding application logic in services, and boxing components and services in modules.
--> 

In this tutorial, you'll build a simple online store application, with a catalog, shopping cart, and check-out feature. 
You don't need to install anything: you'll build the app using the [StackBlitz](https://stackblitz.com/) online development environment.

<!-- 
In this tutorial, we'll introduce you to the building blocks of Angular. We'll leverage what you already know about web development, and teach you the essentials of Angular so you can feel confident exploring Angular's extensive native capabilities and [network of 3rd-party tools and libraries](https://angular.io/resources). 
--> 

<!-- 
*JAF: Removed picture of what you'll build.

<figure>
  <img src='generated/images/guide/toh/component-structure.gif' alt="Angular applications are broken down into a tree of components like on express.google.com">
</figure>

*JAF: Removed outline of the parts. Tell about the other parts at the end of part 1* 

*JAF: Removed the prerequisite skills. Mentioned HTML and JavaScript base above*

*JAF: Provide time estimates for each part* 

-->

<div class="callout is-helpful">
<header>New to Web Development?</header>

You'll find many resources to compliment the Angular docs. Mozilla's MDN docs include both [HTML](https://developer.mozilla.org/en-US/docs/Learn/HTML) and [JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript) introductions. [TypeScript's docs] (https://www.typescriptlang.org/docs/home.html) include a 5-minute tutorial. Various online course platforms, such as Udemy and CodeAcademy, also cover web development basics. 

</div> 

*JAF: Alternate intro text options in comments.*



{@a basic-app}
## 1. Create a new project

<!-- 
<live-example name="getting-started-v0" noDownload title="Click here to create your new project in StackBlitz"></live-example>.
-->

[Click here to create a new Angular project in StackBlitz.](https://stackblitz.com/edit/ng-getting-started-ed34c9)

*JAF: What is the right link to use for GDE review? live-example link commented out because it didn't work locally for me. Previous review version had https://stackblitz.com/fork/ng-getting-started* 

<!--
JAF: Add StackBlitz icon or Angular icon or some other graphic to launch to Stackblitz? 
-->

StackBlitz creates a new Angular app: 

<figure>
  <img src='generated/images/guide/getting-started/new-project.png' alt="New Angular project in Stackblitz">
</figure>

Notice that the right pane displays the running app. 
Creating a new Angular app in Stackblitz (or locally using the Angular [CLI](cli)) always gives you a basic starter app that is ready to run. 

We've seeded this particular app with a top bar&mdash;containing the store name and checkout icon&mdash;and the title for a product catalog. 

<!-- 
<div class="alert is-helpful">

Creating a new Angular app in Stackblitz (or locally using the Angular CLI) always gives you a basic starter app that is ready to run. 
For this Getting Started, we have provided 

the Angular Console, Stackblitz, or any other CLI-based tool 

</div>
-->

<div class="callout is-helpful">
<header>Stackblitz Tips</header>

* Log into StackBlitz, so you can save and resume your work. If you have a GitHub account, you can log into StackBlitz with that account. 
* To copy a code example from this tutorial, click the icon at the top right of the code example box, and then paste the code snippet from the clipboard into Stackblitz. 
* If the Stackblitz preview pane isn't showing what you expect, save and then click the refresh button. 

<!-- 
JAF: Removed tip about creating a fork, naming forks, reopening forks. Maybe introduce that at the end of Part 1 for users who continue.
-->

</div>

<!-- 
 Stackblitz has accelerators that make it easy to develop an Angular application. The accelerators are similar to what is offered by the [Angular CLI](cli) when you are working locally. 
-->

<!-- 
You develop apps in the context of an Angular workspace. A workspace contains the files for one or more projects. A project is the set of files that comprise an app, a library, or end-to-end (e2e) tests. 
-->


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

Stackblitz contains an Angular workspace and an initial app project. The initial app includes the `app-root` component mentioned above, as well as other app and configuration files. The `app-root` component is responsible for displaying "Angular Getting Started" in the preview pane on the right. 



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
1. Bind the click event to the `share()` method in the `product-list.component.ts` file

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

1. Add a route in the `AppModule` for product details, with a `path` of `products/:productId` and `ProductDetailsComponent` for the `component`.

<code-example header="src/app/app.module.ts" path="getting-started-v2/src/app/app.module.ts" region="product-details-route">
</code-example>

Click on each product and route to the product details

No product details information is shown yet

## Success Point

## Using and Managing Data

### Using Services, HttpClient, and router to fetch product details

Add HttpClientModule

1. Import `HttpClientModule` from `@angular/common/http` package.

<code-example header="src/app/app.module.ts" path="getting-started-v2/src/app/app.module.ts" region="http-client-module-import">
</code-example>

1. Add `HttpClientModule` to the `imports` array of the `AppModule`.

This registers Angular's Http Client providers globally.

<code-example header="src/app/app.module.ts" path="getting-started-v2/src/app/app.module.ts" region="http-client-module">
</code-example>

1. Here is a `DataService` defined with some cart functionality that you'll use later. You can define your own services to use also.

<code-example header="src/app/data.service.ts" path="getting-started-v2/src/app/data.service.ts" region="v1">
</code-example>

1. There is some product data in `assets/products.json` already defined. This is to show fetching data from an external source.

<code-example header="src/assets/products.json" path="getting-started-v2/src/assets/products.json">
</code-example>

Import

1. Import `HttpClient` from `@angular/common/http` package.
1. Import `map` operator from `rxjs/operators` package.

<code-example header="src/app/data.service.ts" path="getting-started-v2/src/app/data.service.ts" region="imports">
</code-example>

Inject `HttpClient`

1. Inject `HttpClient` into constructor of `DataService`

<code-example header="src/app/data.service.ts" path="getting-started-v2/src/app/data.service.ts" region="ctor">
</code-example>

Retrieve the product details

1. Add `getOne()` method with a `productId` argument to the `DataService`. 
1. Use the `HttpClient#get()` method to retrieve the products from the JSON file
1. Use the `map` operator to find one product in the array of the products and return it

<code-example header="src/app/data.service.ts" path="getting-started-v2/src/app/data.service.ts" region="get-one">
</code-example>

Update Details Component

Import

1. Import the `ActivatedRoute` service from the `@angular/router` package.
1. Import the `switchMap` operator from the `rxjs/operators` package.
1. Import the `DataService` to use its `getOne()` method to fetch product details.

<code-example header="src/app/product-details/product-details.component.ts" path="getting-started-v2/src/app/product-details/product-details.component.ts" region="imports">
</code-example>

Product Property and Inject Services

1. Remove the `Input` decorator from the `product` property in the product details component.
1. Remove the `share` property from the component.
1. Inject the `ActivatedRoute`, and `DataService` services to access route information and data access methods.

<code-example header="src/app/product-details/product-details.component.ts" path="getting-started-v2/src/app/product-details/product-details.component.ts" region="props-methods">
</code-example>

Retrive product details

1. In the `ngOnInit()` method, set the `product` property to the current route that uses the `paramMap` property on the route to access the `productId` parsed from the URL.
1. Use the `switchMap` operator on the route information stream to map it into a request for product details using the `DataService#getOne()` method
with the `productId`.
1. Subscribe to the details stream and and update the `product` property with the retrieved product details information.

<code-example header="src/app/product-details/product-details.component.ts" path="getting-started-v2/src/app/product-details/product-details.component.ts" region="get-product">
</code-example>

Add to cart

1. Define a `addToCart()` method that receives a `product` and use the previously defined `DataService#addToCart()` method to add the product your cart. Also add an `alert` that the product has been added to the cart.

<code-example header="src/app/product-details/product-details.component.ts" path="getting-started-v2/src/app/product-details/product-details.component.ts" region="add-to-cart">
</code-example>

Update template

1. Remove the `share` button in the template.
1. Add a `button` that says `Buy` to the template with a `click` event binding to call the `addToCart()` method with the `product`.

<code-example header="src/app/product-details/product-details.component.html" path="getting-started-v2/src/app/product-details/product-details.component.html">
</code-example>

## Success Point

## Page 3 - Forms

#### Create cart page

1. Generate cart component

Add cart route

1. Add a route in the `AppModule` for the cart, with a `path` of `cart` and `CartComponent` for the `component`.

<code-example header="src/app/app.module.ts" path="getting-started-v2/src/app/app.module.ts">
</code-example>

#### List cart items and create checkout form

Import

1. Import the `FormBuilder` service from the `@angular/forms` package.
1. Import the `DataService` from the `data.service.ts` file.

<code-example header="src/app/cart/cart.component.ts" path="getting-started-v2/src/app/cart/cart.component.ts" region="imports">
</code-example>

Properties and Inject Services

1. Define `checkoutForm` and `items` properties in the cart component class to store the form model and cart items.
1. Inject the `FormBuilder`, and `DataService` services to build form models and access cart information.
1. Use the `FormBuilder#group()` method to set the `checkoutForm` property with a form model containing `name` and `address` fields.
1. Set the `items` property using the `DataService#getCartItems()` that returns the items in the cart.

<code-example header="src/app/cart/cart.component.ts" path="getting-started-v2/src/app/cart/cart.component.ts" region="props-services">
</code-example>

1. Add a `submit` method to process the form data and clear the cart. In a real-world app, you would submit this data to an external server.
1. Use the `DataService#clearCart()` method to empty the cart items and reset the form after it is submitted.

<code-example header="src/app/cart/cart.component.ts" path="getting-started-v2/src/app/cart/cart.component.ts" region="submit">
</code-example>

Update Template

Display cart items

1. Update the template with a header and use a div with an `*ngFor` to display the cart items and totals.

<code-example header="src/app/cart/cart.component.html" path="getting-started-v2/src/app/cart/cart.component.html" region="cart-items">
</code-example>

Checkout form

1. Add an HTML form to your template to capture user information.
1. Use a `formGroup` property binding to bind the `checkoutForm` to the `form` tag in the template.
1. Use an `ngSubmit` event binding on the `form` tag to listen for form submission and call the `submit` method with the `checkoutForm` value.

<code-example header="src/app/cart/cart.component.html" path="getting-started-v2/src/app/cart/cart.component.html" region="checkout-form-1">
</code-example>


1. Define input fields inside the `form` element for `name` and `address`.
1. Use the `formControlName` attribute binding to bind the `checkoutForm` fields for `name` and `address` to their input fields.
1. Add a `submit` button that says `Purchase` to trigger form submission.

<code-example header="src/app/cart/cart.component.html" path="getting-started-v2/src/app/cart/cart.component.html" region="checkout-form-2">
</code-example>

## Finish