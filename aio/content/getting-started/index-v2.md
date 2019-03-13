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
<header>New to web development?</header>

You'll find many resources to compliment the Angular docs. Mozilla's MDN docs include both [HTML](https://developer.mozilla.org/en-US/docs/Learn/HTML) and [JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript) introductions. [TypeScript's docs] (https://www.typescriptlang.org/docs/home.html) include a 5-minute tutorial. Various online course platforms, such as Udemy and CodeAcademy, also cover web development basics. 

</div> 


{@a basic-app}
## Create a new project

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
<header>Stackblitz tips</header>

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
## Components

Let's take a quick look at the structure of our app.

*Components* are the building blocks of Angular apps. 
A component is comprised of three things: 
* A class that handles data and functionality 
* An HTML template, which determines what is presented to the user 
* Styles that define the look and feel 

An Angular application is composed of a tree of components, in which each Angular component has a specific purpose and responsibility. 

Our starter app has three components: 

<figure>
  <img src='generated/images/guide/getting-started/starter-app-components.png' alt="Online store with three components">
</figure>

* app-root: The application shell. This is first component to load, and the parent of all other components. You can think of it as the base page. 
* app-top-bar: The top bar for our online store, with the store name and checkout button.
* app-product-list: The product list for our online store.. 

Right now, the app displays the title "Products", but it does not display the list of products. In the next section, you'll modify the component's HTML template to display the list of products defined in the component class.


{@a template-syntax}
## Template syntax

Angular extends HTML with a template syntax that gives components control over the display of content. 
This section introduces five things you can do in an Angular template to affect what your user sees, based on the component's state and behavior: 

* `*ngFor`
* `*ngIf`
* Interpolation {{ }}
* Property binding [ ]
* Event binding ( ) 

We'll use these to add the product list to the "Products" area of the app. 


1. Open the `product-list` folder. It contains one file for each part of the component: 
    * `product-list-component.ts` contains the component class definition
    * `product-list-component.html` is the HTML template 
    * `product-list-component.css` contains component-specific styles


1. Open the `product-list-component.ts` file. The `ProductListComponent` class defines properties for two products: 

    ```
    export class ProductListComponent {
      products = [
        {
          id: 1,
          name: 'Phone XL',
          price: 799,
          description: 'A large phone with one of the best screens'
        },
        {
          id: 2,
          name: "Phone Mini",
          price: 699,
          description: 'A great phone with one of the best cameras'
        }
    ```

    We want to display the name and description of these products in our "Products" list. 

1. Open the component's template file `product-list-component.html`. This is the file we'll modify to display the product list.

    <code-example header="src/app/product-list/product-list.component.html" path="getting-started-v2/src/app/product-list/product-list.component.1.html">
    </code-example>

2. We want the `<div>` element to appear once for each product in the list. To do that, use the `*ngFor` directive inside the `<div>`, as shown below:  

    ```
    <h2>Products</h2>

    <!-- ngfor -->
    <div *ngFor="let product of products">
    ```

    <div class="alert is-helpful">
    `*ngFor` is a "structural directive". Structural directives change which HTML or components are displayed.  Technically, they shape or reshape the DOM's structure, typically by adding, removing, and manipulating the elements to which they are attached. Any directive with an * is a structural directive.
    </div>


3. Inside the anchor, display the product's name by using the interpolation syntax {{ }}. Interpolation renders a property's value as text.  

    ```
    <h2>Products</h2>

      <!-- ngFor -->
      <div *ngFor="let product of products">

      <h3>
        <a>
          <!-- interpolation -->
          {{ product.name }}
        </a>
      </h3>
    ```

    The app now displays the name of each product in the list. 

    <figure>
      <img src='generated/images/guide/getting-started/template-syntax-product-names.png' alt="Product names added to list">
    </figure>

    <!--
    The product name anchors are inactive. Later we'll link the displayed names to product details.
    --> 

    <div class="alert is-helpful">
    Reminder: You might need to save the project and reload the preview pane to see the changes. 
    </div>

4. To create hover text for each anchor, we'll use property binding. Bind the anchor's title attribute to the component's product name property by using the property binding syntax [ ]. 

    <code-example header="src/app/product-list/product-list.component.html" path="getting-started-v2/src/app/product-list/product-list.component.2.html">
    </code-example>

    <!-- 
    JAF: Can we display something different from the name?
    -->

5. Add the product descriptions. On the paragraph tag, use an `*ngIf` directive to show the element if it has a description.

    <code-example header="src/app/product-list/product-list.component.html" path="getting-started-v2/src/app/product-list/product-list.component.3.html">
    </code-example>

    <!-- 
    JAF: This might be more compelling if we had a product without a description. Then we can go add a description later. One idea: add a product property for "in stock" and only display products that are in stock. 
    -->

    The app now displays the name and description of each product in the list, as shown here: 

    <figure>
      <img src='generated/images/guide/getting-started/template-syntax-product-description.png' alt="Product descriptions added to list">
    </figure>

6. Add a button so users can share a product with friends. The `ProductListComponent` class (in the `product-list.component.ts` file) already defines a `share()` method, which we can bind to the `click` event. Event binding is done by using ( ) around the event. 

    1. Add a button element to the HTML.
    1. Add an event binding for a `click` event to call the `share()` method in the component. 

        <code-example header="src/app/product-list/product-list.component.html" path="getting-started-v2/src/app/product-list/product-list.component.4.html">
        </code-example>

        <figure>
          <img src='generated/images/guide/getting-started/template-syntax-product-share-button.png' alt="Share button added for each product name">
        </figure>



<div class="alert is-helpful">

To learn about the full capabilities of Angular's template syntax, see the [Template Syntax guide](guide/template-syntax).

</div>

<!-- 
JAF: I want a break here
-->

## Input

At this point, our app is just a product catalog, displaying a list of products, with names and descriptions. 

You might have noticed that the `ProductListComponent` class also defined a price property for each product. We're going to use the anchor on each product name to display additional product details, which will include the price. We'll create that product details view as a new component. We'll pass the selected product in to the product details component. 

<!-- 
JAF: I thought we were using price in the summary and adding description in the details.
-->

1. Generate a new component for product details. 

    Stackblitz includes an Angular Generator, which makes it easy to create new Angular components. 

    1. In the file list, right-click the `app` folder, choose `Angular Generator` and `Component`.

        <figure>
          <img src='generated/images/guide/getting-started/generate-component.png' alt="Generate component">
        </figure>

    1. In the input field, give the new component the name `product-details`.

    Stackblitz creates a skeleton component class, HTML template, and component style sheet. 

1. Open the `product-details.component.ts` component class file. 

    Notice the `@Component` annotation:
    
    ```
    @Component({
      selector: 'app-product-details',
      templateUrl: './product-details.component.html',
      styleUrls: ['./product-details.component.css']
    })
    ```
    
    The *selector* `app-product-details` is the name you use to refer to the Angular component when it is rendered as an HTML element on the page. By convention, Angular component selectors begin with the prefix such as `app-`, followed by the component name. 

    You'll use this name to include the product details element at the bottom of the product list. 

1. Display the product details below the product list. 

    1. Open the `product-list.component.html` template file. 
    1. Below the closing `<div>`, add the product details component as shown here: 
        ```
            <button (click)="share()">
                Share
            </button>
        </div>
        <app-product-details></app-product-details>
        ```
        In the app preview pane, the words "product-details works!" appear the product list. That text is coming from the product details component's template. 

1. Update the product details template (`product-details.component.html`) to display the product name, price, and description instead of "product-details works!":
    ```
    <h2>Product Details</h2>
      <h3>{{ product.name }}</h3>
      <h4>{{ product.price | currency }}</h4>
      <p>{{ product.description }}</p>
    ```
  
    The "Product Details" heading appears instead of "product-details works!". The product properties don't yet appear because the product is unassigned. We need to pass the selected product from the product list into the product details. 

1. Set up the product details component to receive input: 

    1. Return to the `product-details.component.ts` component class file.
    
    1. Import `Input` from the `@angular/core` package.

        <code-example header="src/app/product-details/product-details.component.ts" path="getting-started-v2/src/app/product-details/product-details.component.1.ts" region="imports">
        </code-example>

        <!--
        JAF: Stackblitz doesn't match. Might be less confusing to add the new 3 as a new import statement. 
        -->

        <!--
        JAF: Do we need to explain importing here? 
        -->

    1. In the `ProductDetailsComponent` class, define a property named `product` with an `Input` decorator.

        <code-example header="src/app/product-details/product-details.component.ts" path="getting-started-v2/src/app/product-details/product-details.component.1.ts" region="input-output">
        </code-example>
    
        The @Input decorator specifies that the product data can be passed into your component. 

1. Set up the product list component to manage the selected product: 

    1. Open the `product-list.component.ts` component class file.
    1. In the `ProductListComponent` class, add a `selectedProduct` property.
    1. In the `ProductListComponent` class, add a method named `selectProduct()`. This method sets the `selectedProduct` property with the provided product. 

        <code-example header="src/app/product-list/product-list.component.ts" path="getting-started-v2/src/app/product-list/product-list.component.ts" region="product">
        </code-example>

1. Set up the product list template so that users can select a product name to display the details. 

    1. Open the `product-list.component.html` template file.
    1. To let app users select a product by clicking on a name, add an event binding to the product name anchor element to call `selectProduct(product)`.
        ```
        <h3>
        <!-- property binding -->
           <a [title]="product.name" (click)="selectProduct(product)">
           <!-- interpolation -->
           {{ product.name }}
           </a>
        </h3>
        ```
    1. To display the details for the selected product, update the `<app-product-details>` element to use an `*ngIf` on the product details component for a product
        ```
        <app-product-details
            *ngIf="selectedProduct"
       </app-product-details>
        ```

        If there is no selected product, the "Product Details" section does not display. Reload the preview pane to reset the app to not having a selected product. 

    1. Pass the selected product to the product details component using a property binding:
        ```
        <app-product-details
            *ngIf="selectedProduct"
            [product]="selectedProduct"
       </app-product-details>
        ```


## Output
Using @Output to add to the cart


1. Return to the `product-details.component.ts` component class file, and import `Output` and `EventEmitter` from the `@angular/core` package.

    <code-example header="src/app/product-details/product-details.component.ts" path="getting-started-v2/src/app/product-details/product-details.component.1.ts" region="imports">
    </code-example>

1. Define an output property named `share` with an `Output` decorator and an instance of `EventEmitter`

    <code-example header="src/app/product-details/product-details.component.ts" path="getting-started-v2/src/app/product-details/product-details.component.1.ts" region="input-output">
    </code-example>

1. Add share button to the template with a event binding to call the `share.emit()` method

    <code-example header="src/app/product-details/product-details.component.ts" path="getting-started-v2/src/app/product-details/product-details.component.1.html" region="input-output">
    </code-example>



## Product List to Product Details

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