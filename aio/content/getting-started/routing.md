# Routing

Welcome to lesson 2 of Angular Getting Started. 

At the end of [Lesson 1: Your First App](getting-started), the online store application had a basic product catalog: 

* The app displays a top bar and a product list
* Users can click a "Share" button to simulate sharing the product with someone else
* Users can click a "Notify Me" button to simulate signing up to be notified when a product over $700 goes on sale

Everything is done in the product list component and its child product alerts component. The app is effectively a single "page" with a single URL. 

Up to this point, the app doesn't have any variable states or navigation. There is one URL, and that URL always displays the "My Store" page with a fixed list of products and changeable details below. You can see the URL in the StackBlitz preview pane: `https://ng-getting-started-lesson2.stackblitz.io`.

In this section, you'll modify the app to display the product details in separate pages, with their own URLs.

To do this, you'll use the Angular *Router*. 

The Angular [Router](guide/glossary#router) allows us to show different components and data to the user based on where the user is in the application. 
The router enables navigation from one view to the next as users perform application tasks. 

* Enter a URL in the address bar and the browser navigates to a corresponding page.
* Click links on the page and the browser navigates to a new page.
* Click the browser's back and forward buttons and the browser navigates backward and forward through the history of pages you've seen.

## Registering a route

The app is already set up to use routing in general that navigates to the product list component you modified earlier. Let's define a route to show and individual product details.

1. Generate a new component for product details. Give the component the name `product-details`.

    Reminder: In the file list, right-click the `app` folder, choose `Angular Generator` and `Component`. 

1. In `app.module.ts`, add a route for product details, with a `path` of `products/:productId` and `ProductDetailsComponent` for the `component`.

    <code-example path="getting-started/src/app/app.module.ts" region="product-details-route">
    </code-example>
    
    A route associates one or more URL paths with a component.

1. Define a link using the `RouterLink` directive. The `routerLink` defines how the user navigates to the route (or URL) declaratively
    in the component template.

    We want the user to click a product name to display the details for that product. 

    1. Open `product-list.component.html`.

    1. Update the `*ngFor` directive to assign each index in the `products` array to the `productId` variable when iterating over the list,
    and modify the product name anchor to include a routerLink: 

    <code-example path="getting-started/src/app/product-list/product-list.component.html" region="router-link">
    </code-example>

      The RouterLink directive give the router control over the anchor element. In this case, the route (URL) contains one fixed segment (`/products`) and the final segment is variable, inserting the id property of the current product. For example, the URL for a product with an `id` of 1 will be similar to `https://ng-getting-started-lesson2.stackblitz.io/products/1`. 

1. Test the router by clicking a product name. The app displays the product details component, which currently always says "product-details works." 

    Notice that the URL in the preview window changes. The final segment is `products/1`.

    We'll fix this in the next section. 

## Using route information

The product details component handles the display of each product. The Angular Router displays components based on the browser's URL and your defined routes. You'll use the Angular Router to combine the `products` data and route information to display the specific details for each product.

1. Open `product-details.component.ts`

1. Arrange to use product data from an external file. 

    In `product-details.component.ts`:

    1. Import `ActivatedRoute` from the `@angular/router` package, and the `products` array from `../products`.

        <code-example path="getting-started/src/app/product-details/product-details.component.1.ts" region="imports">
        </code-example>

    1. Define the `product` property and injected the `ActivatedRoute` into the constructor.

        <code-example path="getting-started/src/app/product-details/product-details.component.1.ts" region="props-methods">
        </code-example>

        The `ActivatedRoute` in specific to each routed component loaded by the Angular Router. It contains information about the
        route, its parameters, and additional data associated with the route.

1. In the `ngOnInit()` method, _subscribe_ to route params and fetch the product based on the `productId`.

    <code-example path="getting-started/src/app/product-details/product-details.component.1.ts" region="get-product">
    </code-example>

    The route parameters correspond to the path variables defined in the route. The `productId` is provided from
    the URL that was matched to the route. You use the `productId` display the details for each unique product. 

1. Update the template to display product details information inside an `*ngIf`.

    <code-example path="getting-started/src/app/product-details/product-details.component.html" region="details">
    </code-example>

Now, when the user clicks on a name in the product list, the router navigates you to the distinct URL for the product, swaps out the product list component for the product details component, and displays the product details. 

## Next steps

Congratulations! You have now integrated routing into your online store.

* Products are linked from the product list page to individual products
* Users can click on a product name from the list to see details in a new view, with a distinct URL (route)

To continue exploring Angular, we recommend either of the following options:
* [Continue to the next Getting Started lesson: Managing Data.](getting-started/data) 
* [Skip ahead to the Deployment section](getting-started/deployment) to deploy your app to Firebase or move to local development. 



