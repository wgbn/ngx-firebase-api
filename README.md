# NgxFirebaseApi

This is a library for Angular 12+ that allows you to access your Firestore database without using the realtime JavaScript library provided by Google.

This library is particularly useful for times when you need to access a list or document without needing the original realtime feature, that is, with each request the result is an immutable snapshot that will not be updated in your code if the object/ list undergo any changes in the database.

Due to incompatibility and known bugs of the official Firebase realtima library and SSR features, using the NgxFirebaseApi library will ensure you always have the data you need for correct server-side rendering.

### Heads up!
This library does not replace the use of the original forebase realtime library, on the contrary, the proposal is to work with both at the same time, using NgxFirebaseApi for times when you only need an immutable copy of the data or in the SSR and, for times when that the realtime feature is needed and to make changes to the data, use the official Firebase library.

# Installation
`npm install --save ngx-firebase-api`

### In your app.module.ts
```
...
imports: [
  ...
  NgxFirebaseApi.forRoot({ projectId: 'your_firebase_project_id' })
]
```
Here you must pass your Firebase project ID and, optionally, a new URL for the API endpoints:
- projectId: A string with your Firebase project ID
- baseUrl: (optional) A string with the new API endpoint URL

### In your component
```
...
constructor(private fbApi: NgxFirebaseApiService) {
  this.fbApi.list('users', { where: [['active'], '==', true]] })
    .subscribe(users => console.log(users));
}
...
```

# Methods

## list(collectionPath, args)
- **collectionPath**: The collection can be a root-level collection or a sub-collection within any object. Example: 'users/_userID_/messages'
- **args**: An object with the parameters needed to configure the request. If no objects are provided, the total item listing will be returned, without any filters applied. See the allowed fields below:
  - **where**: To use a WHERE filter, the configuration object must contain a where attribute in array of arrays format, following this pattern [FIELD_NAME, OPERATION, VALUE].
  - **select**: To choose which fields the query should return, use the select attribute passing an array with the names of the fields as they are in the database.
  - **orderBy**: To order a query, pass the orderBy attribute with the name of the field to be ordered. By default the ordering is ascending, to change the order also pass the direction attribute.
  - **direction**: Can be 'asc' or 'desc'.
  - **limit**: To limit the number of results you must pass the limit attribute with an integer value.
  - **offset**: You can pass the offset attribute to skip a number of records.

## get(collectionPath, id)
- **collectionPath**: The collection can be a root-level collection or a sub-collection within any object. Example: 'users/_userID_/messages'
- **id**: The ID of the object you want to query

## setBaseUrl(url)
Changes the default Firestore API endpoint URL.

## setProjectId(id)
Change your Firebase project ID at runtime.

# Examples

`this.afApi.list('users').subscribe(users => console.log(users));`
`this.afApi.list('users/xyz/messages').subscribe(users => console.log(users));`
`this.afApi.list('users', { where: [['active', '==', true]]}).subscribe(users => console.log(users));`
`this.afApi.list('users', { where: [['active', '==', true]], orderBy: 'name' }).subscribe(users => console.log(users));`
`this.afApi.list('users', { where: [['active', '==', true]], orderBy: 'name', select: ['name', 'email'] }).subscribe(users => console.log(users));`
`this.afApi.list('users', { where: [['active', '==', true]], orderBy: 'name', select: ['name', 'email'], limit: 100 }).subscribe(users => console.log(users));`
`this.afApi.list('users', { where: [['active', '==', true]], orderBy: 'name', select: ['name', 'email'], limit: 100, offset: 200 }).subscribe(users => console.log(users));`

`this.afApi.get('users', 'xyz').subscribe(user => console.log(user));`
`this.afApi.get('users/xyz/messages', 'abc').subscribe(user => console.log(user));`

# Observation
If you have your collections secured by authentication (and I hope you do), you should implement a TokenInterceptorService in your Angular application.

The TokenInterceptorService will have the function of intercepting all HTTP requests and injecting an HTTP Authorization Header passing a valid access TOKEN to access the collections. Without this, you will always get a 403 error from the API, because you don't have access permissions.

Internally, NgxFirebaseApi uses the HttpClient to make all requests to the Firebase API.

It is not the function of the library to inject this token, but of the application as a whole. 

You can follow this article to implement your own Token Interceptor https://medium.com/@ryanchenkie_40935/angular-authentication-using-the-http-client-and-http-interceptors-2f9d1540eb8
