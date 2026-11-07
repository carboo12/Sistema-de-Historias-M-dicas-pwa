# Generated TypeScript README
This README will guide you through the process of using the generated JavaScript SDK package for the connector `historias`. It will also provide examples on how to use your generated SDK to call your Data Connect queries and mutations.

***NOTE:** This README is generated alongside the generated SDK. If you make changes to this file, they will be overwritten when the SDK is regenerated.*

# Table of Contents
- [**Overview**](#generated-javascript-readme)
- [**Accessing the connector**](#accessing-the-connector)
  - [*Connecting to the local Emulator*](#connecting-to-the-local-emulator)
- [**Queries**](#queries)
  - [*GetSession*](#getsession)
  - [*ListPatients*](#listpatients)
  - [*CountPatients*](#countpatients)
  - [*ListPatientsByTerms*](#listpatientsbyterms)
  - [*CountPatientsByTerms*](#countpatientsbyterms)
  - [*GetPatient*](#getpatient)
  - [*ListAgenda*](#listagenda)
  - [*ListConsultations*](#listconsultations)
  - [*GetConsultation*](#getconsultation)
  - [*ListPatientStudies*](#listpatientstudies)
  - [*GetCatalogs*](#getcatalogs)
  - [*ClinicReports*](#clinicreports)
- [**Mutations**](#mutations)
  - [*LinkCurrentUser*](#linkcurrentuser)
  - [*CreatePatient*](#createpatient)
  - [*UpdatePatient*](#updatepatient)
  - [*UpdatePatientWithClinicContext*](#updatepatientwithcliniccontext)
  - [*DeletePatient*](#deletepatient)
  - [*CreateAppointment*](#createappointment)
  - [*UpdateAppointmentStatus*](#updateappointmentstatus)
  - [*UpdateAppointment*](#updateappointment)
  - [*CreateConsultation*](#createconsultation)
  - [*UpdateConsultation*](#updateconsultation)
  - [*UpdateConsultationWithClinicContext*](#updateconsultationwithcliniccontext)
  - [*SaveConsultationWithClinicContext*](#saveconsultationwithcliniccontext)
  - [*SignConsultationWithClinicContext*](#signconsultationwithcliniccontext)
  - [*DeleteConsultation*](#deleteconsultation)
  - [*DeleteConsultationWithClinicContext*](#deleteconsultationwithcliniccontext)
  - [*SignConsultation*](#signconsultation)
  - [*CreatePatientStudy*](#createpatientstudy)

# Accessing the connector
A connector is a collection of Queries and Mutations. One SDK is generated for each connector - this SDK is generated for the connector `historias`. You can find more information about connectors in the [Data Connect documentation](https://firebase.google.com/docs/data-connect#how-does).

You can use this generated SDK by importing from the package `@historias/dataconnect` as shown below. Both CommonJS and ESM imports are supported.

You can also follow the instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#set-client).

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@historias/dataconnect';

const dataConnect = getDataConnect(connectorConfig);
```

## Connecting to the local Emulator
By default, the connector will connect to the production service.

To connect to the emulator, you can use the following code.
You can also follow the emulator instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#instrument-clients).

```typescript
import { connectDataConnectEmulator, getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@historias/dataconnect';

const dataConnect = getDataConnect(connectorConfig);
connectDataConnectEmulator(dataConnect, 'localhost', 9399);
```

After it's initialized, you can call your Data Connect [queries](#queries) and [mutations](#mutations) from your generated SDK.

# Queries

There are two ways to execute a Data Connect Query using the generated Web SDK:
- Using a Query Reference function, which returns a `QueryRef`
  - The `QueryRef` can be used as an argument to `executeQuery()`, which will execute the Query and return a `QueryPromise`
- Using an action shortcut function, which returns a `QueryPromise`
  - Calling the action shortcut function will execute the Query and return a `QueryPromise`

The following is true for both the action shortcut function and the `QueryRef` function:
- The `QueryPromise` returned will resolve to the result of the Query once it has finished executing
- If the Query accepts arguments, both the action shortcut function and the `QueryRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Query
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `historias` connector's generated functions to execute each query. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-queries).

## GetSession
You can execute the `GetSession` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
getSession(options?: ExecuteQueryOptions): QueryPromise<GetSessionData, undefined>;

interface GetSessionRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<GetSessionData, undefined>;
}
export const getSessionRef: GetSessionRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getSession(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<GetSessionData, undefined>;

interface GetSessionRef {
  ...
  (dc: DataConnect): QueryRef<GetSessionData, undefined>;
}
export const getSessionRef: GetSessionRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getSessionRef:
```typescript
const name = getSessionRef.operationName;
console.log(name);
```

### Variables
The `GetSession` query has no variables.
### Return Type
Recall that executing the `GetSession` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetSessionData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetSessionData {
  users: ({
    id: UUIDString;
    firebaseUid?: string | null;
    username: string;
    email?: string | null;
    fullName: string;
    role: string;
    mustChangePassword: boolean;
    isActive: boolean;
    clinic: {
      id: UUIDString;
      code: string;
      name: string;
      timezone: string;
      currency: string;
    } & Clinic_Key;
    professional_on_user?: {
      id: UUIDString;
      fullName: string;
      licenseNumber?: string | null;
    } & Professional_Key;
  } & User_Key)[];
}
```
### Using `GetSession`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getSession } from '@historias/dataconnect';


// Call the `getSession()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getSession();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getSession(dataConnect);

console.log(data.users);

// Or, you can use the `Promise` API.
getSession().then((response) => {
  const data = response.data;
  console.log(data.users);
});
```

### Using `GetSession`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getSessionRef } from '@historias/dataconnect';


// Call the `getSessionRef()` function to get a reference to the query.
const ref = getSessionRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getSessionRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.users);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.users);
});
```

## ListPatients
You can execute the `ListPatients` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
listPatients(vars: ListPatientsVariables, options?: ExecuteQueryOptions): QueryPromise<ListPatientsData, ListPatientsVariables>;

interface ListPatientsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: ListPatientsVariables): QueryRef<ListPatientsData, ListPatientsVariables>;
}
export const listPatientsRef: ListPatientsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listPatients(dc: DataConnect, vars: ListPatientsVariables, options?: ExecuteQueryOptions): QueryPromise<ListPatientsData, ListPatientsVariables>;

interface ListPatientsRef {
  ...
  (dc: DataConnect, vars: ListPatientsVariables): QueryRef<ListPatientsData, ListPatientsVariables>;
}
export const listPatientsRef: ListPatientsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listPatientsRef:
```typescript
const name = listPatientsRef.operationName;
console.log(name);
```

### Variables
The `ListPatients` query requires an argument of type `ListPatientsVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface ListPatientsVariables {
  q: string;
  limit: number;
  offset: number;
}
```
### Return Type
Recall that executing the `ListPatients` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListPatientsData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ListPatientsData {
  patients: ({
    id: UUIDString;
    recordNumber: string;
    documentType?: string | null;
    documentNumber?: string | null;
    documentVerified: boolean;
    fullName: string;
    firstName?: string | null;
    lastName?: string | null;
    birthDate?: DateString | null;
    ageOverride?: number | null;
    birthDateEstimated: boolean;
    deceased: boolean;
    sex: string;
    maritalStatus: string;
    bloodType?: string | null;
    nationality?: string | null;
    birthPlace?: string | null;
    address?: string | null;
    city?: string | null;
    state?: string | null;
    country?: string | null;
    phone?: string | null;
    mobile?: string | null;
    email?: string | null;
    occupation?: string | null;
    isPrivate: boolean;
    photoUrl?: string | null;
    allergiesNotes?: string | null;
    currentDiagnosisSummary?: string | null;
    isSuspended: boolean;
    suspensionReason?: string | null;
    notes?: string | null;
    createdAt: TimestampString;
    updatedAt: TimestampString;
    appointments_on_patient: ({
      startsAt: TimestampString;
    })[];
  } & Patient_Key)[];
}
```
### Using `ListPatients`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listPatients, ListPatientsVariables } from '@historias/dataconnect';

// The `ListPatients` query requires an argument of type `ListPatientsVariables`:
const listPatientsVars: ListPatientsVariables = {
  q: ...,
  limit: ...,
  offset: ...,
};

// Call the `listPatients()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listPatients(listPatientsVars);
// Variables can be defined inline as well.
const { data } = await listPatients({ q: ..., limit: ..., offset: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listPatients(dataConnect, listPatientsVars);

console.log(data.patients);

// Or, you can use the `Promise` API.
listPatients(listPatientsVars).then((response) => {
  const data = response.data;
  console.log(data.patients);
});
```

### Using `ListPatients`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listPatientsRef, ListPatientsVariables } from '@historias/dataconnect';

// The `ListPatients` query requires an argument of type `ListPatientsVariables`:
const listPatientsVars: ListPatientsVariables = {
  q: ...,
  limit: ...,
  offset: ...,
};

// Call the `listPatientsRef()` function to get a reference to the query.
const ref = listPatientsRef(listPatientsVars);
// Variables can be defined inline as well.
const ref = listPatientsRef({ q: ..., limit: ..., offset: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listPatientsRef(dataConnect, listPatientsVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.patients);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.patients);
});
```

## CountPatients
You can execute the `CountPatients` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
countPatients(vars: CountPatientsVariables, options?: ExecuteQueryOptions): QueryPromise<CountPatientsData, CountPatientsVariables>;

interface CountPatientsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CountPatientsVariables): QueryRef<CountPatientsData, CountPatientsVariables>;
}
export const countPatientsRef: CountPatientsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
countPatients(dc: DataConnect, vars: CountPatientsVariables, options?: ExecuteQueryOptions): QueryPromise<CountPatientsData, CountPatientsVariables>;

interface CountPatientsRef {
  ...
  (dc: DataConnect, vars: CountPatientsVariables): QueryRef<CountPatientsData, CountPatientsVariables>;
}
export const countPatientsRef: CountPatientsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the countPatientsRef:
```typescript
const name = countPatientsRef.operationName;
console.log(name);
```

### Variables
The `CountPatients` query requires an argument of type `CountPatientsVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CountPatientsVariables {
  q: string;
}
```
### Return Type
Recall that executing the `CountPatients` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CountPatientsData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CountPatientsData {
  patients: ({
    _count: number;
  })[];
}
```
### Using `CountPatients`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, countPatients, CountPatientsVariables } from '@historias/dataconnect';

// The `CountPatients` query requires an argument of type `CountPatientsVariables`:
const countPatientsVars: CountPatientsVariables = {
  q: ...,
};

// Call the `countPatients()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await countPatients(countPatientsVars);
// Variables can be defined inline as well.
const { data } = await countPatients({ q: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await countPatients(dataConnect, countPatientsVars);

console.log(data.patients);

// Or, you can use the `Promise` API.
countPatients(countPatientsVars).then((response) => {
  const data = response.data;
  console.log(data.patients);
});
```

### Using `CountPatients`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, countPatientsRef, CountPatientsVariables } from '@historias/dataconnect';

// The `CountPatients` query requires an argument of type `CountPatientsVariables`:
const countPatientsVars: CountPatientsVariables = {
  q: ...,
};

// Call the `countPatientsRef()` function to get a reference to the query.
const ref = countPatientsRef(countPatientsVars);
// Variables can be defined inline as well.
const ref = countPatientsRef({ q: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = countPatientsRef(dataConnect, countPatientsVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.patients);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.patients);
});
```

## ListPatientsByTerms
You can execute the `ListPatientsByTerms` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
listPatientsByTerms(vars: ListPatientsByTermsVariables, options?: ExecuteQueryOptions): QueryPromise<ListPatientsByTermsData, ListPatientsByTermsVariables>;

interface ListPatientsByTermsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: ListPatientsByTermsVariables): QueryRef<ListPatientsByTermsData, ListPatientsByTermsVariables>;
}
export const listPatientsByTermsRef: ListPatientsByTermsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listPatientsByTerms(dc: DataConnect, vars: ListPatientsByTermsVariables, options?: ExecuteQueryOptions): QueryPromise<ListPatientsByTermsData, ListPatientsByTermsVariables>;

interface ListPatientsByTermsRef {
  ...
  (dc: DataConnect, vars: ListPatientsByTermsVariables): QueryRef<ListPatientsByTermsData, ListPatientsByTermsVariables>;
}
export const listPatientsByTermsRef: ListPatientsByTermsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listPatientsByTermsRef:
```typescript
const name = listPatientsByTermsRef.operationName;
console.log(name);
```

### Variables
The `ListPatientsByTerms` query requires an argument of type `ListPatientsByTermsVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface ListPatientsByTermsVariables {
  q1?: string;
  q2?: string;
  q3?: string;
  q4?: string;
  q5?: string;
  q6?: string;
  limit: number;
  offset: number;
}
```
### Return Type
Recall that executing the `ListPatientsByTerms` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListPatientsByTermsData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ListPatientsByTermsData {
  patients: ({
    id: UUIDString;
    recordNumber: string;
    documentType?: string | null;
    documentNumber?: string | null;
    documentVerified: boolean;
    fullName: string;
    firstName?: string | null;
    lastName?: string | null;
    birthDate?: DateString | null;
    ageOverride?: number | null;
    birthDateEstimated: boolean;
    deceased: boolean;
    sex: string;
    maritalStatus: string;
    bloodType?: string | null;
    nationality?: string | null;
    birthPlace?: string | null;
    address?: string | null;
    city?: string | null;
    state?: string | null;
    country?: string | null;
    phone?: string | null;
    mobile?: string | null;
    email?: string | null;
    occupation?: string | null;
    isPrivate: boolean;
    photoUrl?: string | null;
    allergiesNotes?: string | null;
    currentDiagnosisSummary?: string | null;
    isSuspended: boolean;
    suspensionReason?: string | null;
    notes?: string | null;
    createdAt: TimestampString;
    updatedAt: TimestampString;
    appointments_on_patient: ({
      startsAt: TimestampString;
    })[];
  } & Patient_Key)[];
}
```
### Using `ListPatientsByTerms`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listPatientsByTerms, ListPatientsByTermsVariables } from '@historias/dataconnect';

// The `ListPatientsByTerms` query requires an argument of type `ListPatientsByTermsVariables`:
const listPatientsByTermsVars: ListPatientsByTermsVariables = {
  q1: ..., // optional
  q2: ..., // optional
  q3: ..., // optional
  q4: ..., // optional
  q5: ..., // optional
  q6: ..., // optional
  limit: ...,
  offset: ...,
};

// Call the `listPatientsByTerms()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listPatientsByTerms(listPatientsByTermsVars);
// Variables can be defined inline as well.
const { data } = await listPatientsByTerms({ q1: ..., q2: ..., q3: ..., q4: ..., q5: ..., q6: ..., limit: ..., offset: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listPatientsByTerms(dataConnect, listPatientsByTermsVars);

console.log(data.patients);

// Or, you can use the `Promise` API.
listPatientsByTerms(listPatientsByTermsVars).then((response) => {
  const data = response.data;
  console.log(data.patients);
});
```

### Using `ListPatientsByTerms`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listPatientsByTermsRef, ListPatientsByTermsVariables } from '@historias/dataconnect';

// The `ListPatientsByTerms` query requires an argument of type `ListPatientsByTermsVariables`:
const listPatientsByTermsVars: ListPatientsByTermsVariables = {
  q1: ..., // optional
  q2: ..., // optional
  q3: ..., // optional
  q4: ..., // optional
  q5: ..., // optional
  q6: ..., // optional
  limit: ...,
  offset: ...,
};

// Call the `listPatientsByTermsRef()` function to get a reference to the query.
const ref = listPatientsByTermsRef(listPatientsByTermsVars);
// Variables can be defined inline as well.
const ref = listPatientsByTermsRef({ q1: ..., q2: ..., q3: ..., q4: ..., q5: ..., q6: ..., limit: ..., offset: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listPatientsByTermsRef(dataConnect, listPatientsByTermsVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.patients);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.patients);
});
```

## CountPatientsByTerms
You can execute the `CountPatientsByTerms` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
countPatientsByTerms(vars?: CountPatientsByTermsVariables, options?: ExecuteQueryOptions): QueryPromise<CountPatientsByTermsData, CountPatientsByTermsVariables>;

interface CountPatientsByTermsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars?: CountPatientsByTermsVariables): QueryRef<CountPatientsByTermsData, CountPatientsByTermsVariables>;
}
export const countPatientsByTermsRef: CountPatientsByTermsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
countPatientsByTerms(dc: DataConnect, vars?: CountPatientsByTermsVariables, options?: ExecuteQueryOptions): QueryPromise<CountPatientsByTermsData, CountPatientsByTermsVariables>;

interface CountPatientsByTermsRef {
  ...
  (dc: DataConnect, vars?: CountPatientsByTermsVariables): QueryRef<CountPatientsByTermsData, CountPatientsByTermsVariables>;
}
export const countPatientsByTermsRef: CountPatientsByTermsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the countPatientsByTermsRef:
```typescript
const name = countPatientsByTermsRef.operationName;
console.log(name);
```

### Variables
The `CountPatientsByTerms` query has an optional argument of type `CountPatientsByTermsVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CountPatientsByTermsVariables {
  q1?: string;
  q2?: string;
  q3?: string;
  q4?: string;
  q5?: string;
  q6?: string;
}
```
### Return Type
Recall that executing the `CountPatientsByTerms` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CountPatientsByTermsData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CountPatientsByTermsData {
  patients: ({
    _count: number;
  })[];
}
```
### Using `CountPatientsByTerms`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, countPatientsByTerms, CountPatientsByTermsVariables } from '@historias/dataconnect';

// The `CountPatientsByTerms` query has an optional argument of type `CountPatientsByTermsVariables`:
const countPatientsByTermsVars: CountPatientsByTermsVariables = {
  q1: ..., // optional
  q2: ..., // optional
  q3: ..., // optional
  q4: ..., // optional
  q5: ..., // optional
  q6: ..., // optional
};

// Call the `countPatientsByTerms()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await countPatientsByTerms(countPatientsByTermsVars);
// Variables can be defined inline as well.
const { data } = await countPatientsByTerms({ q1: ..., q2: ..., q3: ..., q4: ..., q5: ..., q6: ..., });
// Since all variables are optional for this query, you can omit the `CountPatientsByTermsVariables` argument.
const { data } = await countPatientsByTerms();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await countPatientsByTerms(dataConnect, countPatientsByTermsVars);

console.log(data.patients);

// Or, you can use the `Promise` API.
countPatientsByTerms(countPatientsByTermsVars).then((response) => {
  const data = response.data;
  console.log(data.patients);
});
```

### Using `CountPatientsByTerms`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, countPatientsByTermsRef, CountPatientsByTermsVariables } from '@historias/dataconnect';

// The `CountPatientsByTerms` query has an optional argument of type `CountPatientsByTermsVariables`:
const countPatientsByTermsVars: CountPatientsByTermsVariables = {
  q1: ..., // optional
  q2: ..., // optional
  q3: ..., // optional
  q4: ..., // optional
  q5: ..., // optional
  q6: ..., // optional
};

// Call the `countPatientsByTermsRef()` function to get a reference to the query.
const ref = countPatientsByTermsRef(countPatientsByTermsVars);
// Variables can be defined inline as well.
const ref = countPatientsByTermsRef({ q1: ..., q2: ..., q3: ..., q4: ..., q5: ..., q6: ..., });
// Since all variables are optional for this query, you can omit the `CountPatientsByTermsVariables` argument.
const ref = countPatientsByTermsRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = countPatientsByTermsRef(dataConnect, countPatientsByTermsVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.patients);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.patients);
});
```

## GetPatient
You can execute the `GetPatient` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
getPatient(vars: GetPatientVariables, options?: ExecuteQueryOptions): QueryPromise<GetPatientData, GetPatientVariables>;

interface GetPatientRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetPatientVariables): QueryRef<GetPatientData, GetPatientVariables>;
}
export const getPatientRef: GetPatientRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getPatient(dc: DataConnect, vars: GetPatientVariables, options?: ExecuteQueryOptions): QueryPromise<GetPatientData, GetPatientVariables>;

interface GetPatientRef {
  ...
  (dc: DataConnect, vars: GetPatientVariables): QueryRef<GetPatientData, GetPatientVariables>;
}
export const getPatientRef: GetPatientRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getPatientRef:
```typescript
const name = getPatientRef.operationName;
console.log(name);
```

### Variables
The `GetPatient` query requires an argument of type `GetPatientVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetPatientVariables {
  id: UUIDString;
}
```
### Return Type
Recall that executing the `GetPatient` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetPatientData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetPatientData {
  patients: ({
    id: UUIDString;
    recordNumber: string;
    documentType?: string | null;
    documentNumber?: string | null;
    documentVerified: boolean;
    fullName: string;
    firstName?: string | null;
    lastName?: string | null;
    birthDate?: DateString | null;
    ageOverride?: number | null;
    birthDateEstimated: boolean;
    deceased: boolean;
    deathDate?: DateString | null;
    sex: string;
    maritalStatus: string;
    bloodType?: string | null;
    nationality?: string | null;
    birthPlace?: string | null;
    address?: string | null;
    city?: string | null;
    state?: string | null;
    country?: string | null;
    phone?: string | null;
    mobile?: string | null;
    email?: string | null;
    occupation?: string | null;
    isPrivate: boolean;
    photoUrl?: string | null;
    allergiesNotes?: string | null;
    currentDiagnosisSummary?: string | null;
    guardianName?: string | null;
    guardianPhone?: string | null;
    religion?: string | null;
    isSuspended: boolean;
    suspensionReason?: string | null;
    notes?: string | null;
    createdAt: TimestampString;
    updatedAt: TimestampString;
    patientHistories_on_patient: ({
      id: UUIDString;
      category: string;
      description: string;
      details: unknown;
      onsetDate?: DateString | null;
      isActive: boolean;
      recordedAt: TimestampString;
    } & PatientHistory_Key)[];
    consultations_on_patient: ({
      id: UUIDString;
      consultedAt: TimestampString;
      status: string;
      reason?: string | null;
      currentIllness?: string | null;
      treatmentPlan?: string | null;
      signedAt?: TimestampString | null;
      updatedAt: TimestampString;
      professional: {
        fullName: string;
      };
    } & Consultation_Key)[];
    appointments_on_patient: ({
      id: UUIDString;
      startsAt: TimestampString;
      endsAt: TimestampString;
      status: string;
      reason?: string | null;
      professional: {
        fullName: string;
      };
    } & Appointment_Key)[];
  } & Patient_Key)[];
}
```
### Using `GetPatient`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getPatient, GetPatientVariables } from '@historias/dataconnect';

// The `GetPatient` query requires an argument of type `GetPatientVariables`:
const getPatientVars: GetPatientVariables = {
  id: ...,
};

// Call the `getPatient()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getPatient(getPatientVars);
// Variables can be defined inline as well.
const { data } = await getPatient({ id: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getPatient(dataConnect, getPatientVars);

console.log(data.patients);

// Or, you can use the `Promise` API.
getPatient(getPatientVars).then((response) => {
  const data = response.data;
  console.log(data.patients);
});
```

### Using `GetPatient`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getPatientRef, GetPatientVariables } from '@historias/dataconnect';

// The `GetPatient` query requires an argument of type `GetPatientVariables`:
const getPatientVars: GetPatientVariables = {
  id: ...,
};

// Call the `getPatientRef()` function to get a reference to the query.
const ref = getPatientRef(getPatientVars);
// Variables can be defined inline as well.
const ref = getPatientRef({ id: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getPatientRef(dataConnect, getPatientVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.patients);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.patients);
});
```

## ListAgenda
You can execute the `ListAgenda` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
listAgenda(vars: ListAgendaVariables, options?: ExecuteQueryOptions): QueryPromise<ListAgendaData, ListAgendaVariables>;

interface ListAgendaRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: ListAgendaVariables): QueryRef<ListAgendaData, ListAgendaVariables>;
}
export const listAgendaRef: ListAgendaRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listAgenda(dc: DataConnect, vars: ListAgendaVariables, options?: ExecuteQueryOptions): QueryPromise<ListAgendaData, ListAgendaVariables>;

interface ListAgendaRef {
  ...
  (dc: DataConnect, vars: ListAgendaVariables): QueryRef<ListAgendaData, ListAgendaVariables>;
}
export const listAgendaRef: ListAgendaRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listAgendaRef:
```typescript
const name = listAgendaRef.operationName;
console.log(name);
```

### Variables
The `ListAgenda` query requires an argument of type `ListAgendaVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface ListAgendaVariables {
  start: TimestampString;
  end: TimestampString;
}
```
### Return Type
Recall that executing the `ListAgenda` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListAgendaData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ListAgendaData {
  appointments: ({
    id: UUIDString;
    patientId: UUIDString;
    professionalId: UUIDString;
    startsAt: TimestampString;
    endsAt: TimestampString;
    durationMinutes: number;
    reason?: string | null;
    status: string;
    notes?: string | null;
    patient: {
      fullName: string;
      email?: string | null;
      recordNumber: string;
      phone?: string | null;
    };
    professional: {
      fullName: string;
    };
    specialty?: {
      name: string;
    };
    office?: {
      name: string;
    };
    consultation_on_appointment?: {
      id: UUIDString;
    } & Consultation_Key;
  } & Appointment_Key)[];
}
```
### Using `ListAgenda`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listAgenda, ListAgendaVariables } from '@historias/dataconnect';

// The `ListAgenda` query requires an argument of type `ListAgendaVariables`:
const listAgendaVars: ListAgendaVariables = {
  start: ...,
  end: ...,
};

// Call the `listAgenda()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listAgenda(listAgendaVars);
// Variables can be defined inline as well.
const { data } = await listAgenda({ start: ..., end: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listAgenda(dataConnect, listAgendaVars);

console.log(data.appointments);

// Or, you can use the `Promise` API.
listAgenda(listAgendaVars).then((response) => {
  const data = response.data;
  console.log(data.appointments);
});
```

### Using `ListAgenda`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listAgendaRef, ListAgendaVariables } from '@historias/dataconnect';

// The `ListAgenda` query requires an argument of type `ListAgendaVariables`:
const listAgendaVars: ListAgendaVariables = {
  start: ...,
  end: ...,
};

// Call the `listAgendaRef()` function to get a reference to the query.
const ref = listAgendaRef(listAgendaVars);
// Variables can be defined inline as well.
const ref = listAgendaRef({ start: ..., end: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listAgendaRef(dataConnect, listAgendaVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.appointments);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.appointments);
});
```

## ListConsultations
You can execute the `ListConsultations` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
listConsultations(options?: ExecuteQueryOptions): QueryPromise<ListConsultationsData, undefined>;

interface ListConsultationsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListConsultationsData, undefined>;
}
export const listConsultationsRef: ListConsultationsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listConsultations(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListConsultationsData, undefined>;

interface ListConsultationsRef {
  ...
  (dc: DataConnect): QueryRef<ListConsultationsData, undefined>;
}
export const listConsultationsRef: ListConsultationsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listConsultationsRef:
```typescript
const name = listConsultationsRef.operationName;
console.log(name);
```

### Variables
The `ListConsultations` query has no variables.
### Return Type
Recall that executing the `ListConsultations` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListConsultationsData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ListConsultationsData {
  consultations: ({
    id: UUIDString;
    consultedAt: TimestampString;
    status: string;
    reason?: string | null;
    currentIllness?: string | null;
    treatmentPlan?: string | null;
    signedAt?: TimestampString | null;
    updatedAt: TimestampString;
    patient: {
      fullName: string;
      recordNumber: string;
    };
    professional: {
      fullName: string;
    };
  } & Consultation_Key)[];
}
```
### Using `ListConsultations`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listConsultations } from '@historias/dataconnect';


// Call the `listConsultations()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listConsultations();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listConsultations(dataConnect);

console.log(data.consultations);

// Or, you can use the `Promise` API.
listConsultations().then((response) => {
  const data = response.data;
  console.log(data.consultations);
});
```

### Using `ListConsultations`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listConsultationsRef } from '@historias/dataconnect';


// Call the `listConsultationsRef()` function to get a reference to the query.
const ref = listConsultationsRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listConsultationsRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.consultations);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.consultations);
});
```

## GetConsultation
You can execute the `GetConsultation` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
getConsultation(vars: GetConsultationVariables, options?: ExecuteQueryOptions): QueryPromise<GetConsultationData, GetConsultationVariables>;

interface GetConsultationRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetConsultationVariables): QueryRef<GetConsultationData, GetConsultationVariables>;
}
export const getConsultationRef: GetConsultationRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getConsultation(dc: DataConnect, vars: GetConsultationVariables, options?: ExecuteQueryOptions): QueryPromise<GetConsultationData, GetConsultationVariables>;

interface GetConsultationRef {
  ...
  (dc: DataConnect, vars: GetConsultationVariables): QueryRef<GetConsultationData, GetConsultationVariables>;
}
export const getConsultationRef: GetConsultationRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getConsultationRef:
```typescript
const name = getConsultationRef.operationName;
console.log(name);
```

### Variables
The `GetConsultation` query requires an argument of type `GetConsultationVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetConsultationVariables {
  id: UUIDString;
}
```
### Return Type
Recall that executing the `GetConsultation` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetConsultationData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetConsultationData {
  consultations: ({
    id: UUIDString;
    clinicId: UUIDString;
    patientId: UUIDString;
    professionalId: UUIDString;
    appointmentId?: UUIDString | null;
    specialtyId?: UUIDString | null;
    consultationType: string;
    consultedAt: TimestampString;
    nextVisitAt?: TimestampString | null;
    reason?: string | null;
    currentIllness?: string | null;
    physicalExam?: string | null;
    functionalExam?: string | null;
    studies?: string | null;
    evolutionText?: string | null;
    studiesText?: string | null;
    prescriptionText?: string | null;
    diagnosisNotes?: string | null;
    treatmentPlan?: string | null;
    evolution?: string | null;
    plan?: string | null;
    notes?: string | null;
    vitals: unknown;
    status: string;
    signedAt?: TimestampString | null;
    createdAt: TimestampString;
    updatedAt: TimestampString;
    patient: {
      fullName: string;
      email?: string | null;
      recordNumber: string;
      birthDate?: DateString | null;
      sex: string;
      allergiesNotes?: string | null;
    };
    professional: {
      fullName: string;
    };
    prescriptions_on_consultation: ({
      legacyId?: string | null;
      prescriptionItems_on_prescription: ({
        medicationName: string;
        presentation?: string | null;
        dose?: string | null;
        frequency?: string | null;
        duration?: string | null;
        quantity?: number | null;
        instructions?: string | null;
        sortOrder: number;
      })[];
    })[];
  } & Consultation_Key)[];
}
```
### Using `GetConsultation`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getConsultation, GetConsultationVariables } from '@historias/dataconnect';

// The `GetConsultation` query requires an argument of type `GetConsultationVariables`:
const getConsultationVars: GetConsultationVariables = {
  id: ...,
};

// Call the `getConsultation()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getConsultation(getConsultationVars);
// Variables can be defined inline as well.
const { data } = await getConsultation({ id: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getConsultation(dataConnect, getConsultationVars);

console.log(data.consultations);

// Or, you can use the `Promise` API.
getConsultation(getConsultationVars).then((response) => {
  const data = response.data;
  console.log(data.consultations);
});
```

### Using `GetConsultation`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getConsultationRef, GetConsultationVariables } from '@historias/dataconnect';

// The `GetConsultation` query requires an argument of type `GetConsultationVariables`:
const getConsultationVars: GetConsultationVariables = {
  id: ...,
};

// Call the `getConsultationRef()` function to get a reference to the query.
const ref = getConsultationRef(getConsultationVars);
// Variables can be defined inline as well.
const ref = getConsultationRef({ id: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getConsultationRef(dataConnect, getConsultationVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.consultations);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.consultations);
});
```

## ListPatientStudies
You can execute the `ListPatientStudies` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
listPatientStudies(vars: ListPatientStudiesVariables, options?: ExecuteQueryOptions): QueryPromise<ListPatientStudiesData, ListPatientStudiesVariables>;

interface ListPatientStudiesRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: ListPatientStudiesVariables): QueryRef<ListPatientStudiesData, ListPatientStudiesVariables>;
}
export const listPatientStudiesRef: ListPatientStudiesRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listPatientStudies(dc: DataConnect, vars: ListPatientStudiesVariables, options?: ExecuteQueryOptions): QueryPromise<ListPatientStudiesData, ListPatientStudiesVariables>;

interface ListPatientStudiesRef {
  ...
  (dc: DataConnect, vars: ListPatientStudiesVariables): QueryRef<ListPatientStudiesData, ListPatientStudiesVariables>;
}
export const listPatientStudiesRef: ListPatientStudiesRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listPatientStudiesRef:
```typescript
const name = listPatientStudiesRef.operationName;
console.log(name);
```

### Variables
The `ListPatientStudies` query requires an argument of type `ListPatientStudiesVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface ListPatientStudiesVariables {
  patientId: UUIDString;
  limit: number;
  offset: number;
}
```
### Return Type
Recall that executing the `ListPatientStudies` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListPatientStudiesData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ListPatientStudiesData {
  patientStudies: ({
    id: UUIDString;
    studyType: string;
    studyName: string;
    performedAt?: TimestampString | null;
    resultSummary?: string | null;
    resultText?: string | null;
    metadata: unknown;
    consultation?: {
      id: UUIDString;
    } & Consultation_Key;
    professional?: {
      fullName: string;
    };
  } & PatientStudy_Key)[];
}
```
### Using `ListPatientStudies`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listPatientStudies, ListPatientStudiesVariables } from '@historias/dataconnect';

// The `ListPatientStudies` query requires an argument of type `ListPatientStudiesVariables`:
const listPatientStudiesVars: ListPatientStudiesVariables = {
  patientId: ...,
  limit: ...,
  offset: ...,
};

// Call the `listPatientStudies()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listPatientStudies(listPatientStudiesVars);
// Variables can be defined inline as well.
const { data } = await listPatientStudies({ patientId: ..., limit: ..., offset: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listPatientStudies(dataConnect, listPatientStudiesVars);

console.log(data.patientStudies);

// Or, you can use the `Promise` API.
listPatientStudies(listPatientStudiesVars).then((response) => {
  const data = response.data;
  console.log(data.patientStudies);
});
```

### Using `ListPatientStudies`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listPatientStudiesRef, ListPatientStudiesVariables } from '@historias/dataconnect';

// The `ListPatientStudies` query requires an argument of type `ListPatientStudiesVariables`:
const listPatientStudiesVars: ListPatientStudiesVariables = {
  patientId: ...,
  limit: ...,
  offset: ...,
};

// Call the `listPatientStudiesRef()` function to get a reference to the query.
const ref = listPatientStudiesRef(listPatientStudiesVars);
// Variables can be defined inline as well.
const ref = listPatientStudiesRef({ patientId: ..., limit: ..., offset: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listPatientStudiesRef(dataConnect, listPatientStudiesVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.patientStudies);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.patientStudies);
});
```

## GetCatalogs
You can execute the `GetCatalogs` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
getCatalogs(options?: ExecuteQueryOptions): QueryPromise<GetCatalogsData, undefined>;

interface GetCatalogsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<GetCatalogsData, undefined>;
}
export const getCatalogsRef: GetCatalogsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getCatalogs(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<GetCatalogsData, undefined>;

interface GetCatalogsRef {
  ...
  (dc: DataConnect): QueryRef<GetCatalogsData, undefined>;
}
export const getCatalogsRef: GetCatalogsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getCatalogsRef:
```typescript
const name = getCatalogsRef.operationName;
console.log(name);
```

### Variables
The `GetCatalogs` query has no variables.
### Return Type
Recall that executing the `GetCatalogs` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetCatalogsData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetCatalogsData {
  users: ({
    clinic: {
      professionals_on_clinic: ({
        id: UUIDString;
        fullName: string;
        licenseNumber?: string | null;
        defaultOfficeId?: UUIDString | null;
      } & Professional_Key)[];
      offices_on_clinic: ({
        id: UUIDString;
        code: string;
        name: string;
        location?: string | null;
      } & Office_Key)[];
      specialties_on_clinic: ({
        id: UUIDString;
        code: string;
        name: string;
      } & Specialty_Key)[];
      consultationReasons_on_clinic: ({
        id: UUIDString;
        code: string;
        name: string;
      } & ConsultationReason_Key)[];
    };
  })[];
}
```
### Using `GetCatalogs`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getCatalogs } from '@historias/dataconnect';


// Call the `getCatalogs()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getCatalogs();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getCatalogs(dataConnect);

console.log(data.users);

// Or, you can use the `Promise` API.
getCatalogs().then((response) => {
  const data = response.data;
  console.log(data.users);
});
```

### Using `GetCatalogs`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getCatalogsRef } from '@historias/dataconnect';


// Call the `getCatalogsRef()` function to get a reference to the query.
const ref = getCatalogsRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getCatalogsRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.users);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.users);
});
```

## ClinicReports
You can execute the `ClinicReports` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
clinicReports(vars: ClinicReportsVariables, options?: ExecuteQueryOptions): QueryPromise<ClinicReportsData, ClinicReportsVariables>;

interface ClinicReportsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: ClinicReportsVariables): QueryRef<ClinicReportsData, ClinicReportsVariables>;
}
export const clinicReportsRef: ClinicReportsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
clinicReports(dc: DataConnect, vars: ClinicReportsVariables, options?: ExecuteQueryOptions): QueryPromise<ClinicReportsData, ClinicReportsVariables>;

interface ClinicReportsRef {
  ...
  (dc: DataConnect, vars: ClinicReportsVariables): QueryRef<ClinicReportsData, ClinicReportsVariables>;
}
export const clinicReportsRef: ClinicReportsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the clinicReportsRef:
```typescript
const name = clinicReportsRef.operationName;
console.log(name);
```

### Variables
The `ClinicReports` query requires an argument of type `ClinicReportsVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface ClinicReportsVariables {
  from: TimestampString;
  to: TimestampString;
  limit: number;
  offset: number;
}
```
### Return Type
Recall that executing the `ClinicReports` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ClinicReportsData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ClinicReportsData {
  consultations: ({
    id: UUIDString;
    consultedAt: TimestampString;
    reason?: string | null;
    professional: {
      fullName: string;
    };
    patient: {
      fullName: string;
      recordNumber: string;
      sex: string;
      birthDate?: DateString | null;
    };
  } & Consultation_Key)[];
  patients: ({
    id: UUIDString;
    createdAt: TimestampString;
    sex: string;
    birthDate?: DateString | null;
  } & Patient_Key)[];
}
```
### Using `ClinicReports`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, clinicReports, ClinicReportsVariables } from '@historias/dataconnect';

// The `ClinicReports` query requires an argument of type `ClinicReportsVariables`:
const clinicReportsVars: ClinicReportsVariables = {
  from: ...,
  to: ...,
  limit: ...,
  offset: ...,
};

// Call the `clinicReports()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await clinicReports(clinicReportsVars);
// Variables can be defined inline as well.
const { data } = await clinicReports({ from: ..., to: ..., limit: ..., offset: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await clinicReports(dataConnect, clinicReportsVars);

console.log(data.consultations);
console.log(data.patients);

// Or, you can use the `Promise` API.
clinicReports(clinicReportsVars).then((response) => {
  const data = response.data;
  console.log(data.consultations);
  console.log(data.patients);
});
```

### Using `ClinicReports`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, clinicReportsRef, ClinicReportsVariables } from '@historias/dataconnect';

// The `ClinicReports` query requires an argument of type `ClinicReportsVariables`:
const clinicReportsVars: ClinicReportsVariables = {
  from: ...,
  to: ...,
  limit: ...,
  offset: ...,
};

// Call the `clinicReportsRef()` function to get a reference to the query.
const ref = clinicReportsRef(clinicReportsVars);
// Variables can be defined inline as well.
const ref = clinicReportsRef({ from: ..., to: ..., limit: ..., offset: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = clinicReportsRef(dataConnect, clinicReportsVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.consultations);
console.log(data.patients);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.consultations);
  console.log(data.patients);
});
```

# Mutations

There are two ways to execute a Data Connect Mutation using the generated Web SDK:
- Using a Mutation Reference function, which returns a `MutationRef`
  - The `MutationRef` can be used as an argument to `executeMutation()`, which will execute the Mutation and return a `MutationPromise`
- Using an action shortcut function, which returns a `MutationPromise`
  - Calling the action shortcut function will execute the Mutation and return a `MutationPromise`

The following is true for both the action shortcut function and the `MutationRef` function:
- The `MutationPromise` returned will resolve to the result of the Mutation once it has finished executing
- If the Mutation accepts arguments, both the action shortcut function and the `MutationRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Mutation
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `historias` connector's generated functions to execute each mutation. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-mutations).

## LinkCurrentUser
You can execute the `LinkCurrentUser` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
linkCurrentUser(): MutationPromise<LinkCurrentUserData, undefined>;

interface LinkCurrentUserRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): MutationRef<LinkCurrentUserData, undefined>;
}
export const linkCurrentUserRef: LinkCurrentUserRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
linkCurrentUser(dc: DataConnect): MutationPromise<LinkCurrentUserData, undefined>;

interface LinkCurrentUserRef {
  ...
  (dc: DataConnect): MutationRef<LinkCurrentUserData, undefined>;
}
export const linkCurrentUserRef: LinkCurrentUserRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the linkCurrentUserRef:
```typescript
const name = linkCurrentUserRef.operationName;
console.log(name);
```

### Variables
The `LinkCurrentUser` mutation has no variables.
### Return Type
Recall that executing the `LinkCurrentUser` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `LinkCurrentUserData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface LinkCurrentUserData {
  user_update?: User_Key | null;
}
```
### Using `LinkCurrentUser`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, linkCurrentUser } from '@historias/dataconnect';


// Call the `linkCurrentUser()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await linkCurrentUser();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await linkCurrentUser(dataConnect);

console.log(data.user_update);

// Or, you can use the `Promise` API.
linkCurrentUser().then((response) => {
  const data = response.data;
  console.log(data.user_update);
});
```

### Using `LinkCurrentUser`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, linkCurrentUserRef } from '@historias/dataconnect';


// Call the `linkCurrentUserRef()` function to get a reference to the mutation.
const ref = linkCurrentUserRef();

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = linkCurrentUserRef(dataConnect);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.user_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.user_update);
});
```

## CreatePatient
You can execute the `CreatePatient` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
createPatient(vars: CreatePatientVariables): MutationPromise<CreatePatientData, CreatePatientVariables>;

interface CreatePatientRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreatePatientVariables): MutationRef<CreatePatientData, CreatePatientVariables>;
}
export const createPatientRef: CreatePatientRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createPatient(dc: DataConnect, vars: CreatePatientVariables): MutationPromise<CreatePatientData, CreatePatientVariables>;

interface CreatePatientRef {
  ...
  (dc: DataConnect, vars: CreatePatientVariables): MutationRef<CreatePatientData, CreatePatientVariables>;
}
export const createPatientRef: CreatePatientRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createPatientRef:
```typescript
const name = createPatientRef.operationName;
console.log(name);
```

### Variables
The `CreatePatient` mutation requires an argument of type `CreatePatientVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CreatePatientVariables {
  clinicId: UUIDString;
  createdById: UUIDString;
  recordNumber: string;
  documentType?: string | null;
  documentNumber?: string | null;
  documentVerified: boolean;
  fullName: string;
  firstName?: string | null;
  lastName?: string | null;
  birthDate?: DateString | null;
  ageOverride?: number | null;
  birthDateEstimated: boolean;
  sex: string;
  maritalStatus: string;
  bloodType?: string | null;
  nationality?: string | null;
  birthPlace?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  phone?: string | null;
  mobile?: string | null;
  email?: string | null;
  occupation?: string | null;
  isPrivate: boolean;
  allergiesNotes?: string | null;
  currentDiagnosisSummary?: string | null;
  notes?: string | null;
  isSuspended: boolean;
  suspensionReason?: string | null;
}
```
### Return Type
Recall that executing the `CreatePatient` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreatePatientData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreatePatientData {
  user_update?: User_Key | null;
  patient_insert: Patient_Key;
}
```
### Using `CreatePatient`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createPatient, CreatePatientVariables } from '@historias/dataconnect';

// The `CreatePatient` mutation requires an argument of type `CreatePatientVariables`:
const createPatientVars: CreatePatientVariables = {
  clinicId: ...,
  createdById: ...,
  recordNumber: ...,
  documentType: ..., // optional
  documentNumber: ..., // optional
  documentVerified: ...,
  fullName: ...,
  firstName: ..., // optional
  lastName: ..., // optional
  birthDate: ..., // optional
  ageOverride: ..., // optional
  birthDateEstimated: ...,
  sex: ...,
  maritalStatus: ...,
  bloodType: ..., // optional
  nationality: ..., // optional
  birthPlace: ..., // optional
  address: ..., // optional
  city: ..., // optional
  state: ..., // optional
  country: ..., // optional
  phone: ..., // optional
  mobile: ..., // optional
  email: ..., // optional
  occupation: ..., // optional
  isPrivate: ...,
  allergiesNotes: ..., // optional
  currentDiagnosisSummary: ..., // optional
  notes: ..., // optional
  isSuspended: ...,
  suspensionReason: ..., // optional
};

// Call the `createPatient()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createPatient(createPatientVars);
// Variables can be defined inline as well.
const { data } = await createPatient({ clinicId: ..., createdById: ..., recordNumber: ..., documentType: ..., documentNumber: ..., documentVerified: ..., fullName: ..., firstName: ..., lastName: ..., birthDate: ..., ageOverride: ..., birthDateEstimated: ..., sex: ..., maritalStatus: ..., bloodType: ..., nationality: ..., birthPlace: ..., address: ..., city: ..., state: ..., country: ..., phone: ..., mobile: ..., email: ..., occupation: ..., isPrivate: ..., allergiesNotes: ..., currentDiagnosisSummary: ..., notes: ..., isSuspended: ..., suspensionReason: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createPatient(dataConnect, createPatientVars);

console.log(data.user_update);
console.log(data.patient_insert);

// Or, you can use the `Promise` API.
createPatient(createPatientVars).then((response) => {
  const data = response.data;
  console.log(data.user_update);
  console.log(data.patient_insert);
});
```

### Using `CreatePatient`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createPatientRef, CreatePatientVariables } from '@historias/dataconnect';

// The `CreatePatient` mutation requires an argument of type `CreatePatientVariables`:
const createPatientVars: CreatePatientVariables = {
  clinicId: ...,
  createdById: ...,
  recordNumber: ...,
  documentType: ..., // optional
  documentNumber: ..., // optional
  documentVerified: ...,
  fullName: ...,
  firstName: ..., // optional
  lastName: ..., // optional
  birthDate: ..., // optional
  ageOverride: ..., // optional
  birthDateEstimated: ...,
  sex: ...,
  maritalStatus: ...,
  bloodType: ..., // optional
  nationality: ..., // optional
  birthPlace: ..., // optional
  address: ..., // optional
  city: ..., // optional
  state: ..., // optional
  country: ..., // optional
  phone: ..., // optional
  mobile: ..., // optional
  email: ..., // optional
  occupation: ..., // optional
  isPrivate: ...,
  allergiesNotes: ..., // optional
  currentDiagnosisSummary: ..., // optional
  notes: ..., // optional
  isSuspended: ...,
  suspensionReason: ..., // optional
};

// Call the `createPatientRef()` function to get a reference to the mutation.
const ref = createPatientRef(createPatientVars);
// Variables can be defined inline as well.
const ref = createPatientRef({ clinicId: ..., createdById: ..., recordNumber: ..., documentType: ..., documentNumber: ..., documentVerified: ..., fullName: ..., firstName: ..., lastName: ..., birthDate: ..., ageOverride: ..., birthDateEstimated: ..., sex: ..., maritalStatus: ..., bloodType: ..., nationality: ..., birthPlace: ..., address: ..., city: ..., state: ..., country: ..., phone: ..., mobile: ..., email: ..., occupation: ..., isPrivate: ..., allergiesNotes: ..., currentDiagnosisSummary: ..., notes: ..., isSuspended: ..., suspensionReason: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createPatientRef(dataConnect, createPatientVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.user_update);
console.log(data.patient_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.user_update);
  console.log(data.patient_insert);
});
```

## UpdatePatient
You can execute the `UpdatePatient` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
updatePatient(vars: UpdatePatientVariables): MutationPromise<UpdatePatientData, UpdatePatientVariables>;

interface UpdatePatientRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdatePatientVariables): MutationRef<UpdatePatientData, UpdatePatientVariables>;
}
export const updatePatientRef: UpdatePatientRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
updatePatient(dc: DataConnect, vars: UpdatePatientVariables): MutationPromise<UpdatePatientData, UpdatePatientVariables>;

interface UpdatePatientRef {
  ...
  (dc: DataConnect, vars: UpdatePatientVariables): MutationRef<UpdatePatientData, UpdatePatientVariables>;
}
export const updatePatientRef: UpdatePatientRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the updatePatientRef:
```typescript
const name = updatePatientRef.operationName;
console.log(name);
```

### Variables
The `UpdatePatient` mutation requires an argument of type `UpdatePatientVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface UpdatePatientVariables {
  id: UUIDString;
  documentType?: string | null;
  documentNumber?: string | null;
  documentVerified: boolean;
  fullName: string;
  firstName?: string | null;
  lastName?: string | null;
  birthDate?: DateString | null;
  ageOverride?: number | null;
  birthDateEstimated: boolean;
  sex: string;
  maritalStatus: string;
  bloodType?: string | null;
  nationality?: string | null;
  birthPlace?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  phone?: string | null;
  mobile?: string | null;
  email?: string | null;
  occupation?: string | null;
  isPrivate: boolean;
  allergiesNotes?: string | null;
  currentDiagnosisSummary?: string | null;
  notes?: string | null;
  isSuspended: boolean;
  suspensionReason?: string | null;
}
```
### Return Type
Recall that executing the `UpdatePatient` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpdatePatientData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpdatePatientData {
  patient_update?: Patient_Key | null;
}
```
### Using `UpdatePatient`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, updatePatient, UpdatePatientVariables } from '@historias/dataconnect';

// The `UpdatePatient` mutation requires an argument of type `UpdatePatientVariables`:
const updatePatientVars: UpdatePatientVariables = {
  id: ...,
  documentType: ..., // optional
  documentNumber: ..., // optional
  documentVerified: ...,
  fullName: ...,
  firstName: ..., // optional
  lastName: ..., // optional
  birthDate: ..., // optional
  ageOverride: ..., // optional
  birthDateEstimated: ...,
  sex: ...,
  maritalStatus: ...,
  bloodType: ..., // optional
  nationality: ..., // optional
  birthPlace: ..., // optional
  address: ..., // optional
  city: ..., // optional
  state: ..., // optional
  country: ..., // optional
  phone: ..., // optional
  mobile: ..., // optional
  email: ..., // optional
  occupation: ..., // optional
  isPrivate: ...,
  allergiesNotes: ..., // optional
  currentDiagnosisSummary: ..., // optional
  notes: ..., // optional
  isSuspended: ...,
  suspensionReason: ..., // optional
};

// Call the `updatePatient()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await updatePatient(updatePatientVars);
// Variables can be defined inline as well.
const { data } = await updatePatient({ id: ..., documentType: ..., documentNumber: ..., documentVerified: ..., fullName: ..., firstName: ..., lastName: ..., birthDate: ..., ageOverride: ..., birthDateEstimated: ..., sex: ..., maritalStatus: ..., bloodType: ..., nationality: ..., birthPlace: ..., address: ..., city: ..., state: ..., country: ..., phone: ..., mobile: ..., email: ..., occupation: ..., isPrivate: ..., allergiesNotes: ..., currentDiagnosisSummary: ..., notes: ..., isSuspended: ..., suspensionReason: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await updatePatient(dataConnect, updatePatientVars);

console.log(data.patient_update);

// Or, you can use the `Promise` API.
updatePatient(updatePatientVars).then((response) => {
  const data = response.data;
  console.log(data.patient_update);
});
```

### Using `UpdatePatient`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, updatePatientRef, UpdatePatientVariables } from '@historias/dataconnect';

// The `UpdatePatient` mutation requires an argument of type `UpdatePatientVariables`:
const updatePatientVars: UpdatePatientVariables = {
  id: ...,
  documentType: ..., // optional
  documentNumber: ..., // optional
  documentVerified: ...,
  fullName: ...,
  firstName: ..., // optional
  lastName: ..., // optional
  birthDate: ..., // optional
  ageOverride: ..., // optional
  birthDateEstimated: ...,
  sex: ...,
  maritalStatus: ...,
  bloodType: ..., // optional
  nationality: ..., // optional
  birthPlace: ..., // optional
  address: ..., // optional
  city: ..., // optional
  state: ..., // optional
  country: ..., // optional
  phone: ..., // optional
  mobile: ..., // optional
  email: ..., // optional
  occupation: ..., // optional
  isPrivate: ...,
  allergiesNotes: ..., // optional
  currentDiagnosisSummary: ..., // optional
  notes: ..., // optional
  isSuspended: ...,
  suspensionReason: ..., // optional
};

// Call the `updatePatientRef()` function to get a reference to the mutation.
const ref = updatePatientRef(updatePatientVars);
// Variables can be defined inline as well.
const ref = updatePatientRef({ id: ..., documentType: ..., documentNumber: ..., documentVerified: ..., fullName: ..., firstName: ..., lastName: ..., birthDate: ..., ageOverride: ..., birthDateEstimated: ..., sex: ..., maritalStatus: ..., bloodType: ..., nationality: ..., birthPlace: ..., address: ..., city: ..., state: ..., country: ..., phone: ..., mobile: ..., email: ..., occupation: ..., isPrivate: ..., allergiesNotes: ..., currentDiagnosisSummary: ..., notes: ..., isSuspended: ..., suspensionReason: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = updatePatientRef(dataConnect, updatePatientVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.patient_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.patient_update);
});
```

## UpdatePatientWithClinicContext
You can execute the `UpdatePatientWithClinicContext` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
updatePatientWithClinicContext(vars: UpdatePatientWithClinicContextVariables): MutationPromise<UpdatePatientWithClinicContextData, UpdatePatientWithClinicContextVariables>;

interface UpdatePatientWithClinicContextRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdatePatientWithClinicContextVariables): MutationRef<UpdatePatientWithClinicContextData, UpdatePatientWithClinicContextVariables>;
}
export const updatePatientWithClinicContextRef: UpdatePatientWithClinicContextRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
updatePatientWithClinicContext(dc: DataConnect, vars: UpdatePatientWithClinicContextVariables): MutationPromise<UpdatePatientWithClinicContextData, UpdatePatientWithClinicContextVariables>;

interface UpdatePatientWithClinicContextRef {
  ...
  (dc: DataConnect, vars: UpdatePatientWithClinicContextVariables): MutationRef<UpdatePatientWithClinicContextData, UpdatePatientWithClinicContextVariables>;
}
export const updatePatientWithClinicContextRef: UpdatePatientWithClinicContextRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the updatePatientWithClinicContextRef:
```typescript
const name = updatePatientWithClinicContextRef.operationName;
console.log(name);
```

### Variables
The `UpdatePatientWithClinicContext` mutation requires an argument of type `UpdatePatientWithClinicContextVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface UpdatePatientWithClinicContextVariables {
  id: UUIDString;
  clinicId: UUIDString;
  documentType?: string | null;
  documentNumber?: string | null;
  documentVerified: boolean;
  fullName: string;
  firstName?: string | null;
  lastName?: string | null;
  birthDate?: DateString | null;
  ageOverride?: number | null;
  birthDateEstimated: boolean;
  sex: string;
  maritalStatus: string;
  bloodType?: string | null;
  nationality?: string | null;
  birthPlace?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  phone?: string | null;
  mobile?: string | null;
  email?: string | null;
  occupation?: string | null;
  isPrivate: boolean;
  allergiesNotes?: string | null;
  currentDiagnosisSummary?: string | null;
  notes?: string | null;
  isSuspended: boolean;
  suspensionReason?: string | null;
}
```
### Return Type
Recall that executing the `UpdatePatientWithClinicContext` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpdatePatientWithClinicContextData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpdatePatientWithClinicContextData {
  user_update?: User_Key | null;
  patient_update?: Patient_Key | null;
}
```
### Using `UpdatePatientWithClinicContext`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, updatePatientWithClinicContext, UpdatePatientWithClinicContextVariables } from '@historias/dataconnect';

// The `UpdatePatientWithClinicContext` mutation requires an argument of type `UpdatePatientWithClinicContextVariables`:
const updatePatientWithClinicContextVars: UpdatePatientWithClinicContextVariables = {
  id: ...,
  clinicId: ...,
  documentType: ..., // optional
  documentNumber: ..., // optional
  documentVerified: ...,
  fullName: ...,
  firstName: ..., // optional
  lastName: ..., // optional
  birthDate: ..., // optional
  ageOverride: ..., // optional
  birthDateEstimated: ...,
  sex: ...,
  maritalStatus: ...,
  bloodType: ..., // optional
  nationality: ..., // optional
  birthPlace: ..., // optional
  address: ..., // optional
  city: ..., // optional
  state: ..., // optional
  country: ..., // optional
  phone: ..., // optional
  mobile: ..., // optional
  email: ..., // optional
  occupation: ..., // optional
  isPrivate: ...,
  allergiesNotes: ..., // optional
  currentDiagnosisSummary: ..., // optional
  notes: ..., // optional
  isSuspended: ...,
  suspensionReason: ..., // optional
};

// Call the `updatePatientWithClinicContext()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await updatePatientWithClinicContext(updatePatientWithClinicContextVars);
// Variables can be defined inline as well.
const { data } = await updatePatientWithClinicContext({ id: ..., clinicId: ..., documentType: ..., documentNumber: ..., documentVerified: ..., fullName: ..., firstName: ..., lastName: ..., birthDate: ..., ageOverride: ..., birthDateEstimated: ..., sex: ..., maritalStatus: ..., bloodType: ..., nationality: ..., birthPlace: ..., address: ..., city: ..., state: ..., country: ..., phone: ..., mobile: ..., email: ..., occupation: ..., isPrivate: ..., allergiesNotes: ..., currentDiagnosisSummary: ..., notes: ..., isSuspended: ..., suspensionReason: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await updatePatientWithClinicContext(dataConnect, updatePatientWithClinicContextVars);

console.log(data.user_update);
console.log(data.patient_update);

// Or, you can use the `Promise` API.
updatePatientWithClinicContext(updatePatientWithClinicContextVars).then((response) => {
  const data = response.data;
  console.log(data.user_update);
  console.log(data.patient_update);
});
```

### Using `UpdatePatientWithClinicContext`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, updatePatientWithClinicContextRef, UpdatePatientWithClinicContextVariables } from '@historias/dataconnect';

// The `UpdatePatientWithClinicContext` mutation requires an argument of type `UpdatePatientWithClinicContextVariables`:
const updatePatientWithClinicContextVars: UpdatePatientWithClinicContextVariables = {
  id: ...,
  clinicId: ...,
  documentType: ..., // optional
  documentNumber: ..., // optional
  documentVerified: ...,
  fullName: ...,
  firstName: ..., // optional
  lastName: ..., // optional
  birthDate: ..., // optional
  ageOverride: ..., // optional
  birthDateEstimated: ...,
  sex: ...,
  maritalStatus: ...,
  bloodType: ..., // optional
  nationality: ..., // optional
  birthPlace: ..., // optional
  address: ..., // optional
  city: ..., // optional
  state: ..., // optional
  country: ..., // optional
  phone: ..., // optional
  mobile: ..., // optional
  email: ..., // optional
  occupation: ..., // optional
  isPrivate: ...,
  allergiesNotes: ..., // optional
  currentDiagnosisSummary: ..., // optional
  notes: ..., // optional
  isSuspended: ...,
  suspensionReason: ..., // optional
};

// Call the `updatePatientWithClinicContextRef()` function to get a reference to the mutation.
const ref = updatePatientWithClinicContextRef(updatePatientWithClinicContextVars);
// Variables can be defined inline as well.
const ref = updatePatientWithClinicContextRef({ id: ..., clinicId: ..., documentType: ..., documentNumber: ..., documentVerified: ..., fullName: ..., firstName: ..., lastName: ..., birthDate: ..., ageOverride: ..., birthDateEstimated: ..., sex: ..., maritalStatus: ..., bloodType: ..., nationality: ..., birthPlace: ..., address: ..., city: ..., state: ..., country: ..., phone: ..., mobile: ..., email: ..., occupation: ..., isPrivate: ..., allergiesNotes: ..., currentDiagnosisSummary: ..., notes: ..., isSuspended: ..., suspensionReason: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = updatePatientWithClinicContextRef(dataConnect, updatePatientWithClinicContextVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.user_update);
console.log(data.patient_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.user_update);
  console.log(data.patient_update);
});
```

## DeletePatient
You can execute the `DeletePatient` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
deletePatient(vars: DeletePatientVariables): MutationPromise<DeletePatientData, DeletePatientVariables>;

interface DeletePatientRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeletePatientVariables): MutationRef<DeletePatientData, DeletePatientVariables>;
}
export const deletePatientRef: DeletePatientRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
deletePatient(dc: DataConnect, vars: DeletePatientVariables): MutationPromise<DeletePatientData, DeletePatientVariables>;

interface DeletePatientRef {
  ...
  (dc: DataConnect, vars: DeletePatientVariables): MutationRef<DeletePatientData, DeletePatientVariables>;
}
export const deletePatientRef: DeletePatientRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the deletePatientRef:
```typescript
const name = deletePatientRef.operationName;
console.log(name);
```

### Variables
The `DeletePatient` mutation requires an argument of type `DeletePatientVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface DeletePatientVariables {
  id: UUIDString;
}
```
### Return Type
Recall that executing the `DeletePatient` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `DeletePatientData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface DeletePatientData {
  patient_update?: Patient_Key | null;
}
```
### Using `DeletePatient`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, deletePatient, DeletePatientVariables } from '@historias/dataconnect';

// The `DeletePatient` mutation requires an argument of type `DeletePatientVariables`:
const deletePatientVars: DeletePatientVariables = {
  id: ...,
};

// Call the `deletePatient()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await deletePatient(deletePatientVars);
// Variables can be defined inline as well.
const { data } = await deletePatient({ id: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await deletePatient(dataConnect, deletePatientVars);

console.log(data.patient_update);

// Or, you can use the `Promise` API.
deletePatient(deletePatientVars).then((response) => {
  const data = response.data;
  console.log(data.patient_update);
});
```

### Using `DeletePatient`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, deletePatientRef, DeletePatientVariables } from '@historias/dataconnect';

// The `DeletePatient` mutation requires an argument of type `DeletePatientVariables`:
const deletePatientVars: DeletePatientVariables = {
  id: ...,
};

// Call the `deletePatientRef()` function to get a reference to the mutation.
const ref = deletePatientRef(deletePatientVars);
// Variables can be defined inline as well.
const ref = deletePatientRef({ id: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = deletePatientRef(dataConnect, deletePatientVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.patient_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.patient_update);
});
```

## CreateAppointment
You can execute the `CreateAppointment` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
createAppointment(vars: CreateAppointmentVariables): MutationPromise<CreateAppointmentData, CreateAppointmentVariables>;

interface CreateAppointmentRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateAppointmentVariables): MutationRef<CreateAppointmentData, CreateAppointmentVariables>;
}
export const createAppointmentRef: CreateAppointmentRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createAppointment(dc: DataConnect, vars: CreateAppointmentVariables): MutationPromise<CreateAppointmentData, CreateAppointmentVariables>;

interface CreateAppointmentRef {
  ...
  (dc: DataConnect, vars: CreateAppointmentVariables): MutationRef<CreateAppointmentData, CreateAppointmentVariables>;
}
export const createAppointmentRef: CreateAppointmentRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createAppointmentRef:
```typescript
const name = createAppointmentRef.operationName;
console.log(name);
```

### Variables
The `CreateAppointment` mutation requires an argument of type `CreateAppointmentVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CreateAppointmentVariables {
  clinicId: UUIDString;
  createdById: UUIDString;
  patientId: UUIDString;
  professionalId: UUIDString;
  specialtyId?: UUIDString | null;
  officeId?: UUIDString | null;
  startsAt: TimestampString;
  endsAt: TimestampString;
  durationMinutes: number;
  reason?: string | null;
  notes?: string | null;
  status: string;
  source: string;
}
```
### Return Type
Recall that executing the `CreateAppointment` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateAppointmentData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateAppointmentData {
  user_update?: User_Key | null;
  appointment_insert: Appointment_Key;
}
```
### Using `CreateAppointment`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createAppointment, CreateAppointmentVariables } from '@historias/dataconnect';

// The `CreateAppointment` mutation requires an argument of type `CreateAppointmentVariables`:
const createAppointmentVars: CreateAppointmentVariables = {
  clinicId: ...,
  createdById: ...,
  patientId: ...,
  professionalId: ...,
  specialtyId: ..., // optional
  officeId: ..., // optional
  startsAt: ...,
  endsAt: ...,
  durationMinutes: ...,
  reason: ..., // optional
  notes: ..., // optional
  status: ...,
  source: ...,
};

// Call the `createAppointment()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createAppointment(createAppointmentVars);
// Variables can be defined inline as well.
const { data } = await createAppointment({ clinicId: ..., createdById: ..., patientId: ..., professionalId: ..., specialtyId: ..., officeId: ..., startsAt: ..., endsAt: ..., durationMinutes: ..., reason: ..., notes: ..., status: ..., source: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createAppointment(dataConnect, createAppointmentVars);

console.log(data.user_update);
console.log(data.appointment_insert);

// Or, you can use the `Promise` API.
createAppointment(createAppointmentVars).then((response) => {
  const data = response.data;
  console.log(data.user_update);
  console.log(data.appointment_insert);
});
```

### Using `CreateAppointment`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createAppointmentRef, CreateAppointmentVariables } from '@historias/dataconnect';

// The `CreateAppointment` mutation requires an argument of type `CreateAppointmentVariables`:
const createAppointmentVars: CreateAppointmentVariables = {
  clinicId: ...,
  createdById: ...,
  patientId: ...,
  professionalId: ...,
  specialtyId: ..., // optional
  officeId: ..., // optional
  startsAt: ...,
  endsAt: ...,
  durationMinutes: ...,
  reason: ..., // optional
  notes: ..., // optional
  status: ...,
  source: ...,
};

// Call the `createAppointmentRef()` function to get a reference to the mutation.
const ref = createAppointmentRef(createAppointmentVars);
// Variables can be defined inline as well.
const ref = createAppointmentRef({ clinicId: ..., createdById: ..., patientId: ..., professionalId: ..., specialtyId: ..., officeId: ..., startsAt: ..., endsAt: ..., durationMinutes: ..., reason: ..., notes: ..., status: ..., source: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createAppointmentRef(dataConnect, createAppointmentVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.user_update);
console.log(data.appointment_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.user_update);
  console.log(data.appointment_insert);
});
```

## UpdateAppointmentStatus
You can execute the `UpdateAppointmentStatus` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
updateAppointmentStatus(vars: UpdateAppointmentStatusVariables): MutationPromise<UpdateAppointmentStatusData, UpdateAppointmentStatusVariables>;

interface UpdateAppointmentStatusRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateAppointmentStatusVariables): MutationRef<UpdateAppointmentStatusData, UpdateAppointmentStatusVariables>;
}
export const updateAppointmentStatusRef: UpdateAppointmentStatusRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
updateAppointmentStatus(dc: DataConnect, vars: UpdateAppointmentStatusVariables): MutationPromise<UpdateAppointmentStatusData, UpdateAppointmentStatusVariables>;

interface UpdateAppointmentStatusRef {
  ...
  (dc: DataConnect, vars: UpdateAppointmentStatusVariables): MutationRef<UpdateAppointmentStatusData, UpdateAppointmentStatusVariables>;
}
export const updateAppointmentStatusRef: UpdateAppointmentStatusRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the updateAppointmentStatusRef:
```typescript
const name = updateAppointmentStatusRef.operationName;
console.log(name);
```

### Variables
The `UpdateAppointmentStatus` mutation requires an argument of type `UpdateAppointmentStatusVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface UpdateAppointmentStatusVariables {
  id: UUIDString;
  status: string;
}
```
### Return Type
Recall that executing the `UpdateAppointmentStatus` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpdateAppointmentStatusData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpdateAppointmentStatusData {
  appointment_update?: Appointment_Key | null;
}
```
### Using `UpdateAppointmentStatus`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, updateAppointmentStatus, UpdateAppointmentStatusVariables } from '@historias/dataconnect';

// The `UpdateAppointmentStatus` mutation requires an argument of type `UpdateAppointmentStatusVariables`:
const updateAppointmentStatusVars: UpdateAppointmentStatusVariables = {
  id: ...,
  status: ...,
};

// Call the `updateAppointmentStatus()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await updateAppointmentStatus(updateAppointmentStatusVars);
// Variables can be defined inline as well.
const { data } = await updateAppointmentStatus({ id: ..., status: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await updateAppointmentStatus(dataConnect, updateAppointmentStatusVars);

console.log(data.appointment_update);

// Or, you can use the `Promise` API.
updateAppointmentStatus(updateAppointmentStatusVars).then((response) => {
  const data = response.data;
  console.log(data.appointment_update);
});
```

### Using `UpdateAppointmentStatus`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, updateAppointmentStatusRef, UpdateAppointmentStatusVariables } from '@historias/dataconnect';

// The `UpdateAppointmentStatus` mutation requires an argument of type `UpdateAppointmentStatusVariables`:
const updateAppointmentStatusVars: UpdateAppointmentStatusVariables = {
  id: ...,
  status: ...,
};

// Call the `updateAppointmentStatusRef()` function to get a reference to the mutation.
const ref = updateAppointmentStatusRef(updateAppointmentStatusVars);
// Variables can be defined inline as well.
const ref = updateAppointmentStatusRef({ id: ..., status: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = updateAppointmentStatusRef(dataConnect, updateAppointmentStatusVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.appointment_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.appointment_update);
});
```

## UpdateAppointment
You can execute the `UpdateAppointment` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
updateAppointment(vars: UpdateAppointmentVariables): MutationPromise<UpdateAppointmentData, UpdateAppointmentVariables>;

interface UpdateAppointmentRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateAppointmentVariables): MutationRef<UpdateAppointmentData, UpdateAppointmentVariables>;
}
export const updateAppointmentRef: UpdateAppointmentRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
updateAppointment(dc: DataConnect, vars: UpdateAppointmentVariables): MutationPromise<UpdateAppointmentData, UpdateAppointmentVariables>;

interface UpdateAppointmentRef {
  ...
  (dc: DataConnect, vars: UpdateAppointmentVariables): MutationRef<UpdateAppointmentData, UpdateAppointmentVariables>;
}
export const updateAppointmentRef: UpdateAppointmentRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the updateAppointmentRef:
```typescript
const name = updateAppointmentRef.operationName;
console.log(name);
```

### Variables
The `UpdateAppointment` mutation requires an argument of type `UpdateAppointmentVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface UpdateAppointmentVariables {
  id: UUIDString;
  startsAt: TimestampString;
  endsAt: TimestampString;
  durationMinutes: number;
  reason?: string | null;
  notes?: string | null;
  status: string;
}
```
### Return Type
Recall that executing the `UpdateAppointment` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpdateAppointmentData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpdateAppointmentData {
  appointment_update?: Appointment_Key | null;
}
```
### Using `UpdateAppointment`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, updateAppointment, UpdateAppointmentVariables } from '@historias/dataconnect';

// The `UpdateAppointment` mutation requires an argument of type `UpdateAppointmentVariables`:
const updateAppointmentVars: UpdateAppointmentVariables = {
  id: ...,
  startsAt: ...,
  endsAt: ...,
  durationMinutes: ...,
  reason: ..., // optional
  notes: ..., // optional
  status: ...,
};

// Call the `updateAppointment()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await updateAppointment(updateAppointmentVars);
// Variables can be defined inline as well.
const { data } = await updateAppointment({ id: ..., startsAt: ..., endsAt: ..., durationMinutes: ..., reason: ..., notes: ..., status: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await updateAppointment(dataConnect, updateAppointmentVars);

console.log(data.appointment_update);

// Or, you can use the `Promise` API.
updateAppointment(updateAppointmentVars).then((response) => {
  const data = response.data;
  console.log(data.appointment_update);
});
```

### Using `UpdateAppointment`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, updateAppointmentRef, UpdateAppointmentVariables } from '@historias/dataconnect';

// The `UpdateAppointment` mutation requires an argument of type `UpdateAppointmentVariables`:
const updateAppointmentVars: UpdateAppointmentVariables = {
  id: ...,
  startsAt: ...,
  endsAt: ...,
  durationMinutes: ...,
  reason: ..., // optional
  notes: ..., // optional
  status: ...,
};

// Call the `updateAppointmentRef()` function to get a reference to the mutation.
const ref = updateAppointmentRef(updateAppointmentVars);
// Variables can be defined inline as well.
const ref = updateAppointmentRef({ id: ..., startsAt: ..., endsAt: ..., durationMinutes: ..., reason: ..., notes: ..., status: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = updateAppointmentRef(dataConnect, updateAppointmentVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.appointment_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.appointment_update);
});
```

## CreateConsultation
You can execute the `CreateConsultation` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
createConsultation(vars: CreateConsultationVariables): MutationPromise<CreateConsultationData, CreateConsultationVariables>;

interface CreateConsultationRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateConsultationVariables): MutationRef<CreateConsultationData, CreateConsultationVariables>;
}
export const createConsultationRef: CreateConsultationRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createConsultation(dc: DataConnect, vars: CreateConsultationVariables): MutationPromise<CreateConsultationData, CreateConsultationVariables>;

interface CreateConsultationRef {
  ...
  (dc: DataConnect, vars: CreateConsultationVariables): MutationRef<CreateConsultationData, CreateConsultationVariables>;
}
export const createConsultationRef: CreateConsultationRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createConsultationRef:
```typescript
const name = createConsultationRef.operationName;
console.log(name);
```

### Variables
The `CreateConsultation` mutation requires an argument of type `CreateConsultationVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CreateConsultationVariables {
  clinicId: UUIDString;
  createdById: UUIDString;
  patientId: UUIDString;
  professionalId: UUIDString;
  appointmentId?: UUIDString | null;
  specialtyId?: UUIDString | null;
  consultationType: string;
  consultedAt: TimestampString;
  reason?: string | null;
  notes?: string | null;
  status: string;
  source: string;
}
```
### Return Type
Recall that executing the `CreateConsultation` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateConsultationData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateConsultationData {
  user_update?: User_Key | null;
  consultation_insert: Consultation_Key;
}
```
### Using `CreateConsultation`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createConsultation, CreateConsultationVariables } from '@historias/dataconnect';

// The `CreateConsultation` mutation requires an argument of type `CreateConsultationVariables`:
const createConsultationVars: CreateConsultationVariables = {
  clinicId: ...,
  createdById: ...,
  patientId: ...,
  professionalId: ...,
  appointmentId: ..., // optional
  specialtyId: ..., // optional
  consultationType: ...,
  consultedAt: ...,
  reason: ..., // optional
  notes: ..., // optional
  status: ...,
  source: ...,
};

// Call the `createConsultation()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createConsultation(createConsultationVars);
// Variables can be defined inline as well.
const { data } = await createConsultation({ clinicId: ..., createdById: ..., patientId: ..., professionalId: ..., appointmentId: ..., specialtyId: ..., consultationType: ..., consultedAt: ..., reason: ..., notes: ..., status: ..., source: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createConsultation(dataConnect, createConsultationVars);

console.log(data.user_update);
console.log(data.consultation_insert);

// Or, you can use the `Promise` API.
createConsultation(createConsultationVars).then((response) => {
  const data = response.data;
  console.log(data.user_update);
  console.log(data.consultation_insert);
});
```

### Using `CreateConsultation`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createConsultationRef, CreateConsultationVariables } from '@historias/dataconnect';

// The `CreateConsultation` mutation requires an argument of type `CreateConsultationVariables`:
const createConsultationVars: CreateConsultationVariables = {
  clinicId: ...,
  createdById: ...,
  patientId: ...,
  professionalId: ...,
  appointmentId: ..., // optional
  specialtyId: ..., // optional
  consultationType: ...,
  consultedAt: ...,
  reason: ..., // optional
  notes: ..., // optional
  status: ...,
  source: ...,
};

// Call the `createConsultationRef()` function to get a reference to the mutation.
const ref = createConsultationRef(createConsultationVars);
// Variables can be defined inline as well.
const ref = createConsultationRef({ clinicId: ..., createdById: ..., patientId: ..., professionalId: ..., appointmentId: ..., specialtyId: ..., consultationType: ..., consultedAt: ..., reason: ..., notes: ..., status: ..., source: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createConsultationRef(dataConnect, createConsultationVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.user_update);
console.log(data.consultation_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.user_update);
  console.log(data.consultation_insert);
});
```

## UpdateConsultation
You can execute the `UpdateConsultation` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
updateConsultation(vars: UpdateConsultationVariables): MutationPromise<UpdateConsultationData, UpdateConsultationVariables>;

interface UpdateConsultationRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateConsultationVariables): MutationRef<UpdateConsultationData, UpdateConsultationVariables>;
}
export const updateConsultationRef: UpdateConsultationRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
updateConsultation(dc: DataConnect, vars: UpdateConsultationVariables): MutationPromise<UpdateConsultationData, UpdateConsultationVariables>;

interface UpdateConsultationRef {
  ...
  (dc: DataConnect, vars: UpdateConsultationVariables): MutationRef<UpdateConsultationData, UpdateConsultationVariables>;
}
export const updateConsultationRef: UpdateConsultationRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the updateConsultationRef:
```typescript
const name = updateConsultationRef.operationName;
console.log(name);
```

### Variables
The `UpdateConsultation` mutation requires an argument of type `UpdateConsultationVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface UpdateConsultationVariables {
  id: UUIDString;
  nextVisitAt?: TimestampString | null;
  reason?: string | null;
  currentIllness?: string | null;
  physicalExam?: string | null;
  functionalExam?: string | null;
  studies?: string | null;
  evolutionText?: string | null;
  studiesText?: string | null;
  prescriptionText?: string | null;
  diagnosisNotes?: string | null;
  treatmentPlan?: string | null;
  evolution?: string | null;
  plan?: string | null;
  notes?: string | null;
  vitals: unknown;
}
```
### Return Type
Recall that executing the `UpdateConsultation` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpdateConsultationData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpdateConsultationData {
  consultation_update?: Consultation_Key | null;
}
```
### Using `UpdateConsultation`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, updateConsultation, UpdateConsultationVariables } from '@historias/dataconnect';

// The `UpdateConsultation` mutation requires an argument of type `UpdateConsultationVariables`:
const updateConsultationVars: UpdateConsultationVariables = {
  id: ...,
  nextVisitAt: ..., // optional
  reason: ..., // optional
  currentIllness: ..., // optional
  physicalExam: ..., // optional
  functionalExam: ..., // optional
  studies: ..., // optional
  evolutionText: ..., // optional
  studiesText: ..., // optional
  prescriptionText: ..., // optional
  diagnosisNotes: ..., // optional
  treatmentPlan: ..., // optional
  evolution: ..., // optional
  plan: ..., // optional
  notes: ..., // optional
  vitals: ...,
};

// Call the `updateConsultation()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await updateConsultation(updateConsultationVars);
// Variables can be defined inline as well.
const { data } = await updateConsultation({ id: ..., nextVisitAt: ..., reason: ..., currentIllness: ..., physicalExam: ..., functionalExam: ..., studies: ..., evolutionText: ..., studiesText: ..., prescriptionText: ..., diagnosisNotes: ..., treatmentPlan: ..., evolution: ..., plan: ..., notes: ..., vitals: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await updateConsultation(dataConnect, updateConsultationVars);

console.log(data.consultation_update);

// Or, you can use the `Promise` API.
updateConsultation(updateConsultationVars).then((response) => {
  const data = response.data;
  console.log(data.consultation_update);
});
```

### Using `UpdateConsultation`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, updateConsultationRef, UpdateConsultationVariables } from '@historias/dataconnect';

// The `UpdateConsultation` mutation requires an argument of type `UpdateConsultationVariables`:
const updateConsultationVars: UpdateConsultationVariables = {
  id: ...,
  nextVisitAt: ..., // optional
  reason: ..., // optional
  currentIllness: ..., // optional
  physicalExam: ..., // optional
  functionalExam: ..., // optional
  studies: ..., // optional
  evolutionText: ..., // optional
  studiesText: ..., // optional
  prescriptionText: ..., // optional
  diagnosisNotes: ..., // optional
  treatmentPlan: ..., // optional
  evolution: ..., // optional
  plan: ..., // optional
  notes: ..., // optional
  vitals: ...,
};

// Call the `updateConsultationRef()` function to get a reference to the mutation.
const ref = updateConsultationRef(updateConsultationVars);
// Variables can be defined inline as well.
const ref = updateConsultationRef({ id: ..., nextVisitAt: ..., reason: ..., currentIllness: ..., physicalExam: ..., functionalExam: ..., studies: ..., evolutionText: ..., studiesText: ..., prescriptionText: ..., diagnosisNotes: ..., treatmentPlan: ..., evolution: ..., plan: ..., notes: ..., vitals: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = updateConsultationRef(dataConnect, updateConsultationVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.consultation_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.consultation_update);
});
```

## UpdateConsultationWithClinicContext
You can execute the `UpdateConsultationWithClinicContext` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
updateConsultationWithClinicContext(vars: UpdateConsultationWithClinicContextVariables): MutationPromise<UpdateConsultationWithClinicContextData, UpdateConsultationWithClinicContextVariables>;

interface UpdateConsultationWithClinicContextRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateConsultationWithClinicContextVariables): MutationRef<UpdateConsultationWithClinicContextData, UpdateConsultationWithClinicContextVariables>;
}
export const updateConsultationWithClinicContextRef: UpdateConsultationWithClinicContextRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
updateConsultationWithClinicContext(dc: DataConnect, vars: UpdateConsultationWithClinicContextVariables): MutationPromise<UpdateConsultationWithClinicContextData, UpdateConsultationWithClinicContextVariables>;

interface UpdateConsultationWithClinicContextRef {
  ...
  (dc: DataConnect, vars: UpdateConsultationWithClinicContextVariables): MutationRef<UpdateConsultationWithClinicContextData, UpdateConsultationWithClinicContextVariables>;
}
export const updateConsultationWithClinicContextRef: UpdateConsultationWithClinicContextRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the updateConsultationWithClinicContextRef:
```typescript
const name = updateConsultationWithClinicContextRef.operationName;
console.log(name);
```

### Variables
The `UpdateConsultationWithClinicContext` mutation requires an argument of type `UpdateConsultationWithClinicContextVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface UpdateConsultationWithClinicContextVariables {
  id: UUIDString;
  clinicId: UUIDString;
  nextVisitAt?: TimestampString | null;
  reason?: string | null;
  currentIllness?: string | null;
  physicalExam?: string | null;
  functionalExam?: string | null;
  studies?: string | null;
  evolutionText?: string | null;
  studiesText?: string | null;
  prescriptionText?: string | null;
  diagnosisNotes?: string | null;
  treatmentPlan?: string | null;
  evolution?: string | null;
  plan?: string | null;
  notes?: string | null;
  vitals: unknown;
}
```
### Return Type
Recall that executing the `UpdateConsultationWithClinicContext` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpdateConsultationWithClinicContextData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpdateConsultationWithClinicContextData {
  user_update?: User_Key | null;
  consultation_update?: Consultation_Key | null;
}
```
### Using `UpdateConsultationWithClinicContext`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, updateConsultationWithClinicContext, UpdateConsultationWithClinicContextVariables } from '@historias/dataconnect';

// The `UpdateConsultationWithClinicContext` mutation requires an argument of type `UpdateConsultationWithClinicContextVariables`:
const updateConsultationWithClinicContextVars: UpdateConsultationWithClinicContextVariables = {
  id: ...,
  clinicId: ...,
  nextVisitAt: ..., // optional
  reason: ..., // optional
  currentIllness: ..., // optional
  physicalExam: ..., // optional
  functionalExam: ..., // optional
  studies: ..., // optional
  evolutionText: ..., // optional
  studiesText: ..., // optional
  prescriptionText: ..., // optional
  diagnosisNotes: ..., // optional
  treatmentPlan: ..., // optional
  evolution: ..., // optional
  plan: ..., // optional
  notes: ..., // optional
  vitals: ...,
};

// Call the `updateConsultationWithClinicContext()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await updateConsultationWithClinicContext(updateConsultationWithClinicContextVars);
// Variables can be defined inline as well.
const { data } = await updateConsultationWithClinicContext({ id: ..., clinicId: ..., nextVisitAt: ..., reason: ..., currentIllness: ..., physicalExam: ..., functionalExam: ..., studies: ..., evolutionText: ..., studiesText: ..., prescriptionText: ..., diagnosisNotes: ..., treatmentPlan: ..., evolution: ..., plan: ..., notes: ..., vitals: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await updateConsultationWithClinicContext(dataConnect, updateConsultationWithClinicContextVars);

console.log(data.user_update);
console.log(data.consultation_update);

// Or, you can use the `Promise` API.
updateConsultationWithClinicContext(updateConsultationWithClinicContextVars).then((response) => {
  const data = response.data;
  console.log(data.user_update);
  console.log(data.consultation_update);
});
```

### Using `UpdateConsultationWithClinicContext`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, updateConsultationWithClinicContextRef, UpdateConsultationWithClinicContextVariables } from '@historias/dataconnect';

// The `UpdateConsultationWithClinicContext` mutation requires an argument of type `UpdateConsultationWithClinicContextVariables`:
const updateConsultationWithClinicContextVars: UpdateConsultationWithClinicContextVariables = {
  id: ...,
  clinicId: ...,
  nextVisitAt: ..., // optional
  reason: ..., // optional
  currentIllness: ..., // optional
  physicalExam: ..., // optional
  functionalExam: ..., // optional
  studies: ..., // optional
  evolutionText: ..., // optional
  studiesText: ..., // optional
  prescriptionText: ..., // optional
  diagnosisNotes: ..., // optional
  treatmentPlan: ..., // optional
  evolution: ..., // optional
  plan: ..., // optional
  notes: ..., // optional
  vitals: ...,
};

// Call the `updateConsultationWithClinicContextRef()` function to get a reference to the mutation.
const ref = updateConsultationWithClinicContextRef(updateConsultationWithClinicContextVars);
// Variables can be defined inline as well.
const ref = updateConsultationWithClinicContextRef({ id: ..., clinicId: ..., nextVisitAt: ..., reason: ..., currentIllness: ..., physicalExam: ..., functionalExam: ..., studies: ..., evolutionText: ..., studiesText: ..., prescriptionText: ..., diagnosisNotes: ..., treatmentPlan: ..., evolution: ..., plan: ..., notes: ..., vitals: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = updateConsultationWithClinicContextRef(dataConnect, updateConsultationWithClinicContextVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.user_update);
console.log(data.consultation_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.user_update);
  console.log(data.consultation_update);
});
```

## SaveConsultationWithClinicContext
You can execute the `SaveConsultationWithClinicContext` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
saveConsultationWithClinicContext(vars: SaveConsultationWithClinicContextVariables): MutationPromise<SaveConsultationWithClinicContextData, SaveConsultationWithClinicContextVariables>;

interface SaveConsultationWithClinicContextRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: SaveConsultationWithClinicContextVariables): MutationRef<SaveConsultationWithClinicContextData, SaveConsultationWithClinicContextVariables>;
}
export const saveConsultationWithClinicContextRef: SaveConsultationWithClinicContextRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
saveConsultationWithClinicContext(dc: DataConnect, vars: SaveConsultationWithClinicContextVariables): MutationPromise<SaveConsultationWithClinicContextData, SaveConsultationWithClinicContextVariables>;

interface SaveConsultationWithClinicContextRef {
  ...
  (dc: DataConnect, vars: SaveConsultationWithClinicContextVariables): MutationRef<SaveConsultationWithClinicContextData, SaveConsultationWithClinicContextVariables>;
}
export const saveConsultationWithClinicContextRef: SaveConsultationWithClinicContextRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the saveConsultationWithClinicContextRef:
```typescript
const name = saveConsultationWithClinicContextRef.operationName;
console.log(name);
```

### Variables
The `SaveConsultationWithClinicContext` mutation requires an argument of type `SaveConsultationWithClinicContextVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface SaveConsultationWithClinicContextVariables {
  id: UUIDString;
  clinicId: UUIDString;
  status: string;
  nextVisitAt?: TimestampString | null;
  reason?: string | null;
  currentIllness?: string | null;
  physicalExam?: string | null;
  functionalExam?: string | null;
  studies?: string | null;
  evolutionText?: string | null;
  studiesText?: string | null;
  prescriptionText?: string | null;
  diagnosisNotes?: string | null;
  treatmentPlan?: string | null;
  evolution?: string | null;
  plan?: string | null;
  notes?: string | null;
  vitals: unknown;
}
```
### Return Type
Recall that executing the `SaveConsultationWithClinicContext` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `SaveConsultationWithClinicContextData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface SaveConsultationWithClinicContextData {
  user_update?: User_Key | null;
  consultation_update?: Consultation_Key | null;
}
```
### Using `SaveConsultationWithClinicContext`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, saveConsultationWithClinicContext, SaveConsultationWithClinicContextVariables } from '@historias/dataconnect';

// The `SaveConsultationWithClinicContext` mutation requires an argument of type `SaveConsultationWithClinicContextVariables`:
const saveConsultationWithClinicContextVars: SaveConsultationWithClinicContextVariables = {
  id: ...,
  clinicId: ...,
  status: ...,
  nextVisitAt: ..., // optional
  reason: ..., // optional
  currentIllness: ..., // optional
  physicalExam: ..., // optional
  functionalExam: ..., // optional
  studies: ..., // optional
  evolutionText: ..., // optional
  studiesText: ..., // optional
  prescriptionText: ..., // optional
  diagnosisNotes: ..., // optional
  treatmentPlan: ..., // optional
  evolution: ..., // optional
  plan: ..., // optional
  notes: ..., // optional
  vitals: ...,
};

// Call the `saveConsultationWithClinicContext()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await saveConsultationWithClinicContext(saveConsultationWithClinicContextVars);
// Variables can be defined inline as well.
const { data } = await saveConsultationWithClinicContext({ id: ..., clinicId: ..., status: ..., nextVisitAt: ..., reason: ..., currentIllness: ..., physicalExam: ..., functionalExam: ..., studies: ..., evolutionText: ..., studiesText: ..., prescriptionText: ..., diagnosisNotes: ..., treatmentPlan: ..., evolution: ..., plan: ..., notes: ..., vitals: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await saveConsultationWithClinicContext(dataConnect, saveConsultationWithClinicContextVars);

console.log(data.user_update);
console.log(data.consultation_update);

// Or, you can use the `Promise` API.
saveConsultationWithClinicContext(saveConsultationWithClinicContextVars).then((response) => {
  const data = response.data;
  console.log(data.user_update);
  console.log(data.consultation_update);
});
```

### Using `SaveConsultationWithClinicContext`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, saveConsultationWithClinicContextRef, SaveConsultationWithClinicContextVariables } from '@historias/dataconnect';

// The `SaveConsultationWithClinicContext` mutation requires an argument of type `SaveConsultationWithClinicContextVariables`:
const saveConsultationWithClinicContextVars: SaveConsultationWithClinicContextVariables = {
  id: ...,
  clinicId: ...,
  status: ...,
  nextVisitAt: ..., // optional
  reason: ..., // optional
  currentIllness: ..., // optional
  physicalExam: ..., // optional
  functionalExam: ..., // optional
  studies: ..., // optional
  evolutionText: ..., // optional
  studiesText: ..., // optional
  prescriptionText: ..., // optional
  diagnosisNotes: ..., // optional
  treatmentPlan: ..., // optional
  evolution: ..., // optional
  plan: ..., // optional
  notes: ..., // optional
  vitals: ...,
};

// Call the `saveConsultationWithClinicContextRef()` function to get a reference to the mutation.
const ref = saveConsultationWithClinicContextRef(saveConsultationWithClinicContextVars);
// Variables can be defined inline as well.
const ref = saveConsultationWithClinicContextRef({ id: ..., clinicId: ..., status: ..., nextVisitAt: ..., reason: ..., currentIllness: ..., physicalExam: ..., functionalExam: ..., studies: ..., evolutionText: ..., studiesText: ..., prescriptionText: ..., diagnosisNotes: ..., treatmentPlan: ..., evolution: ..., plan: ..., notes: ..., vitals: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = saveConsultationWithClinicContextRef(dataConnect, saveConsultationWithClinicContextVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.user_update);
console.log(data.consultation_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.user_update);
  console.log(data.consultation_update);
});
```

## SignConsultationWithClinicContext
You can execute the `SignConsultationWithClinicContext` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
signConsultationWithClinicContext(vars: SignConsultationWithClinicContextVariables): MutationPromise<SignConsultationWithClinicContextData, SignConsultationWithClinicContextVariables>;

interface SignConsultationWithClinicContextRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: SignConsultationWithClinicContextVariables): MutationRef<SignConsultationWithClinicContextData, SignConsultationWithClinicContextVariables>;
}
export const signConsultationWithClinicContextRef: SignConsultationWithClinicContextRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
signConsultationWithClinicContext(dc: DataConnect, vars: SignConsultationWithClinicContextVariables): MutationPromise<SignConsultationWithClinicContextData, SignConsultationWithClinicContextVariables>;

interface SignConsultationWithClinicContextRef {
  ...
  (dc: DataConnect, vars: SignConsultationWithClinicContextVariables): MutationRef<SignConsultationWithClinicContextData, SignConsultationWithClinicContextVariables>;
}
export const signConsultationWithClinicContextRef: SignConsultationWithClinicContextRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the signConsultationWithClinicContextRef:
```typescript
const name = signConsultationWithClinicContextRef.operationName;
console.log(name);
```

### Variables
The `SignConsultationWithClinicContext` mutation requires an argument of type `SignConsultationWithClinicContextVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface SignConsultationWithClinicContextVariables {
  id: UUIDString;
  clinicId: UUIDString;
  signedById: UUIDString;
  appointmentId?: UUIDString | null;
  skipAppointmentUpdate: boolean;
  nextVisitAt?: TimestampString | null;
  reason?: string | null;
  currentIllness?: string | null;
  physicalExam?: string | null;
  functionalExam?: string | null;
  studies?: string | null;
  evolutionText?: string | null;
  studiesText?: string | null;
  prescriptionText?: string | null;
  diagnosisNotes?: string | null;
  treatmentPlan?: string | null;
  evolution?: string | null;
  plan?: string | null;
  notes?: string | null;
  vitals: unknown;
}
```
### Return Type
Recall that executing the `SignConsultationWithClinicContext` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `SignConsultationWithClinicContextData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface SignConsultationWithClinicContextData {
  user_update?: User_Key | null;
  consultation_update?: Consultation_Key | null;
  appointment_update?: Appointment_Key | null;
}
```
### Using `SignConsultationWithClinicContext`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, signConsultationWithClinicContext, SignConsultationWithClinicContextVariables } from '@historias/dataconnect';

// The `SignConsultationWithClinicContext` mutation requires an argument of type `SignConsultationWithClinicContextVariables`:
const signConsultationWithClinicContextVars: SignConsultationWithClinicContextVariables = {
  id: ...,
  clinicId: ...,
  signedById: ...,
  appointmentId: ..., // optional
  skipAppointmentUpdate: ...,
  nextVisitAt: ..., // optional
  reason: ..., // optional
  currentIllness: ..., // optional
  physicalExam: ..., // optional
  functionalExam: ..., // optional
  studies: ..., // optional
  evolutionText: ..., // optional
  studiesText: ..., // optional
  prescriptionText: ..., // optional
  diagnosisNotes: ..., // optional
  treatmentPlan: ..., // optional
  evolution: ..., // optional
  plan: ..., // optional
  notes: ..., // optional
  vitals: ...,
};

// Call the `signConsultationWithClinicContext()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await signConsultationWithClinicContext(signConsultationWithClinicContextVars);
// Variables can be defined inline as well.
const { data } = await signConsultationWithClinicContext({ id: ..., clinicId: ..., signedById: ..., appointmentId: ..., skipAppointmentUpdate: ..., nextVisitAt: ..., reason: ..., currentIllness: ..., physicalExam: ..., functionalExam: ..., studies: ..., evolutionText: ..., studiesText: ..., prescriptionText: ..., diagnosisNotes: ..., treatmentPlan: ..., evolution: ..., plan: ..., notes: ..., vitals: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await signConsultationWithClinicContext(dataConnect, signConsultationWithClinicContextVars);

console.log(data.user_update);
console.log(data.consultation_update);
console.log(data.appointment_update);

// Or, you can use the `Promise` API.
signConsultationWithClinicContext(signConsultationWithClinicContextVars).then((response) => {
  const data = response.data;
  console.log(data.user_update);
  console.log(data.consultation_update);
  console.log(data.appointment_update);
});
```

### Using `SignConsultationWithClinicContext`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, signConsultationWithClinicContextRef, SignConsultationWithClinicContextVariables } from '@historias/dataconnect';

// The `SignConsultationWithClinicContext` mutation requires an argument of type `SignConsultationWithClinicContextVariables`:
const signConsultationWithClinicContextVars: SignConsultationWithClinicContextVariables = {
  id: ...,
  clinicId: ...,
  signedById: ...,
  appointmentId: ..., // optional
  skipAppointmentUpdate: ...,
  nextVisitAt: ..., // optional
  reason: ..., // optional
  currentIllness: ..., // optional
  physicalExam: ..., // optional
  functionalExam: ..., // optional
  studies: ..., // optional
  evolutionText: ..., // optional
  studiesText: ..., // optional
  prescriptionText: ..., // optional
  diagnosisNotes: ..., // optional
  treatmentPlan: ..., // optional
  evolution: ..., // optional
  plan: ..., // optional
  notes: ..., // optional
  vitals: ...,
};

// Call the `signConsultationWithClinicContextRef()` function to get a reference to the mutation.
const ref = signConsultationWithClinicContextRef(signConsultationWithClinicContextVars);
// Variables can be defined inline as well.
const ref = signConsultationWithClinicContextRef({ id: ..., clinicId: ..., signedById: ..., appointmentId: ..., skipAppointmentUpdate: ..., nextVisitAt: ..., reason: ..., currentIllness: ..., physicalExam: ..., functionalExam: ..., studies: ..., evolutionText: ..., studiesText: ..., prescriptionText: ..., diagnosisNotes: ..., treatmentPlan: ..., evolution: ..., plan: ..., notes: ..., vitals: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = signConsultationWithClinicContextRef(dataConnect, signConsultationWithClinicContextVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.user_update);
console.log(data.consultation_update);
console.log(data.appointment_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.user_update);
  console.log(data.consultation_update);
  console.log(data.appointment_update);
});
```

## DeleteConsultation
You can execute the `DeleteConsultation` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
deleteConsultation(vars: DeleteConsultationVariables): MutationPromise<DeleteConsultationData, DeleteConsultationVariables>;

interface DeleteConsultationRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeleteConsultationVariables): MutationRef<DeleteConsultationData, DeleteConsultationVariables>;
}
export const deleteConsultationRef: DeleteConsultationRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
deleteConsultation(dc: DataConnect, vars: DeleteConsultationVariables): MutationPromise<DeleteConsultationData, DeleteConsultationVariables>;

interface DeleteConsultationRef {
  ...
  (dc: DataConnect, vars: DeleteConsultationVariables): MutationRef<DeleteConsultationData, DeleteConsultationVariables>;
}
export const deleteConsultationRef: DeleteConsultationRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the deleteConsultationRef:
```typescript
const name = deleteConsultationRef.operationName;
console.log(name);
```

### Variables
The `DeleteConsultation` mutation requires an argument of type `DeleteConsultationVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface DeleteConsultationVariables {
  id: UUIDString;
}
```
### Return Type
Recall that executing the `DeleteConsultation` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `DeleteConsultationData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface DeleteConsultationData {
  consultation_update?: Consultation_Key | null;
}
```
### Using `DeleteConsultation`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, deleteConsultation, DeleteConsultationVariables } from '@historias/dataconnect';

// The `DeleteConsultation` mutation requires an argument of type `DeleteConsultationVariables`:
const deleteConsultationVars: DeleteConsultationVariables = {
  id: ...,
};

// Call the `deleteConsultation()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await deleteConsultation(deleteConsultationVars);
// Variables can be defined inline as well.
const { data } = await deleteConsultation({ id: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await deleteConsultation(dataConnect, deleteConsultationVars);

console.log(data.consultation_update);

// Or, you can use the `Promise` API.
deleteConsultation(deleteConsultationVars).then((response) => {
  const data = response.data;
  console.log(data.consultation_update);
});
```

### Using `DeleteConsultation`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, deleteConsultationRef, DeleteConsultationVariables } from '@historias/dataconnect';

// The `DeleteConsultation` mutation requires an argument of type `DeleteConsultationVariables`:
const deleteConsultationVars: DeleteConsultationVariables = {
  id: ...,
};

// Call the `deleteConsultationRef()` function to get a reference to the mutation.
const ref = deleteConsultationRef(deleteConsultationVars);
// Variables can be defined inline as well.
const ref = deleteConsultationRef({ id: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = deleteConsultationRef(dataConnect, deleteConsultationVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.consultation_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.consultation_update);
});
```

## DeleteConsultationWithClinicContext
You can execute the `DeleteConsultationWithClinicContext` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
deleteConsultationWithClinicContext(vars: DeleteConsultationWithClinicContextVariables): MutationPromise<DeleteConsultationWithClinicContextData, DeleteConsultationWithClinicContextVariables>;

interface DeleteConsultationWithClinicContextRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeleteConsultationWithClinicContextVariables): MutationRef<DeleteConsultationWithClinicContextData, DeleteConsultationWithClinicContextVariables>;
}
export const deleteConsultationWithClinicContextRef: DeleteConsultationWithClinicContextRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
deleteConsultationWithClinicContext(dc: DataConnect, vars: DeleteConsultationWithClinicContextVariables): MutationPromise<DeleteConsultationWithClinicContextData, DeleteConsultationWithClinicContextVariables>;

interface DeleteConsultationWithClinicContextRef {
  ...
  (dc: DataConnect, vars: DeleteConsultationWithClinicContextVariables): MutationRef<DeleteConsultationWithClinicContextData, DeleteConsultationWithClinicContextVariables>;
}
export const deleteConsultationWithClinicContextRef: DeleteConsultationWithClinicContextRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the deleteConsultationWithClinicContextRef:
```typescript
const name = deleteConsultationWithClinicContextRef.operationName;
console.log(name);
```

### Variables
The `DeleteConsultationWithClinicContext` mutation requires an argument of type `DeleteConsultationWithClinicContextVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface DeleteConsultationWithClinicContextVariables {
  id: UUIDString;
  clinicId: UUIDString;
}
```
### Return Type
Recall that executing the `DeleteConsultationWithClinicContext` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `DeleteConsultationWithClinicContextData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface DeleteConsultationWithClinicContextData {
  user_update?: User_Key | null;
  consultation_update?: Consultation_Key | null;
}
```
### Using `DeleteConsultationWithClinicContext`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, deleteConsultationWithClinicContext, DeleteConsultationWithClinicContextVariables } from '@historias/dataconnect';

// The `DeleteConsultationWithClinicContext` mutation requires an argument of type `DeleteConsultationWithClinicContextVariables`:
const deleteConsultationWithClinicContextVars: DeleteConsultationWithClinicContextVariables = {
  id: ...,
  clinicId: ...,
};

// Call the `deleteConsultationWithClinicContext()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await deleteConsultationWithClinicContext(deleteConsultationWithClinicContextVars);
// Variables can be defined inline as well.
const { data } = await deleteConsultationWithClinicContext({ id: ..., clinicId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await deleteConsultationWithClinicContext(dataConnect, deleteConsultationWithClinicContextVars);

console.log(data.user_update);
console.log(data.consultation_update);

// Or, you can use the `Promise` API.
deleteConsultationWithClinicContext(deleteConsultationWithClinicContextVars).then((response) => {
  const data = response.data;
  console.log(data.user_update);
  console.log(data.consultation_update);
});
```

### Using `DeleteConsultationWithClinicContext`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, deleteConsultationWithClinicContextRef, DeleteConsultationWithClinicContextVariables } from '@historias/dataconnect';

// The `DeleteConsultationWithClinicContext` mutation requires an argument of type `DeleteConsultationWithClinicContextVariables`:
const deleteConsultationWithClinicContextVars: DeleteConsultationWithClinicContextVariables = {
  id: ...,
  clinicId: ...,
};

// Call the `deleteConsultationWithClinicContextRef()` function to get a reference to the mutation.
const ref = deleteConsultationWithClinicContextRef(deleteConsultationWithClinicContextVars);
// Variables can be defined inline as well.
const ref = deleteConsultationWithClinicContextRef({ id: ..., clinicId: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = deleteConsultationWithClinicContextRef(dataConnect, deleteConsultationWithClinicContextVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.user_update);
console.log(data.consultation_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.user_update);
  console.log(data.consultation_update);
});
```

## SignConsultation
You can execute the `SignConsultation` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
signConsultation(vars: SignConsultationVariables): MutationPromise<SignConsultationData, SignConsultationVariables>;

interface SignConsultationRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: SignConsultationVariables): MutationRef<SignConsultationData, SignConsultationVariables>;
}
export const signConsultationRef: SignConsultationRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
signConsultation(dc: DataConnect, vars: SignConsultationVariables): MutationPromise<SignConsultationData, SignConsultationVariables>;

interface SignConsultationRef {
  ...
  (dc: DataConnect, vars: SignConsultationVariables): MutationRef<SignConsultationData, SignConsultationVariables>;
}
export const signConsultationRef: SignConsultationRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the signConsultationRef:
```typescript
const name = signConsultationRef.operationName;
console.log(name);
```

### Variables
The `SignConsultation` mutation requires an argument of type `SignConsultationVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface SignConsultationVariables {
  id: UUIDString;
  signedById: UUIDString;
}
```
### Return Type
Recall that executing the `SignConsultation` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `SignConsultationData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface SignConsultationData {
  user_update?: User_Key | null;
  consultation_update?: Consultation_Key | null;
}
```
### Using `SignConsultation`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, signConsultation, SignConsultationVariables } from '@historias/dataconnect';

// The `SignConsultation` mutation requires an argument of type `SignConsultationVariables`:
const signConsultationVars: SignConsultationVariables = {
  id: ...,
  signedById: ...,
};

// Call the `signConsultation()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await signConsultation(signConsultationVars);
// Variables can be defined inline as well.
const { data } = await signConsultation({ id: ..., signedById: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await signConsultation(dataConnect, signConsultationVars);

console.log(data.user_update);
console.log(data.consultation_update);

// Or, you can use the `Promise` API.
signConsultation(signConsultationVars).then((response) => {
  const data = response.data;
  console.log(data.user_update);
  console.log(data.consultation_update);
});
```

### Using `SignConsultation`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, signConsultationRef, SignConsultationVariables } from '@historias/dataconnect';

// The `SignConsultation` mutation requires an argument of type `SignConsultationVariables`:
const signConsultationVars: SignConsultationVariables = {
  id: ...,
  signedById: ...,
};

// Call the `signConsultationRef()` function to get a reference to the mutation.
const ref = signConsultationRef(signConsultationVars);
// Variables can be defined inline as well.
const ref = signConsultationRef({ id: ..., signedById: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = signConsultationRef(dataConnect, signConsultationVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.user_update);
console.log(data.consultation_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.user_update);
  console.log(data.consultation_update);
});
```

## CreatePatientStudy
You can execute the `CreatePatientStudy` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
createPatientStudy(vars: CreatePatientStudyVariables): MutationPromise<CreatePatientStudyData, CreatePatientStudyVariables>;

interface CreatePatientStudyRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreatePatientStudyVariables): MutationRef<CreatePatientStudyData, CreatePatientStudyVariables>;
}
export const createPatientStudyRef: CreatePatientStudyRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createPatientStudy(dc: DataConnect, vars: CreatePatientStudyVariables): MutationPromise<CreatePatientStudyData, CreatePatientStudyVariables>;

interface CreatePatientStudyRef {
  ...
  (dc: DataConnect, vars: CreatePatientStudyVariables): MutationRef<CreatePatientStudyData, CreatePatientStudyVariables>;
}
export const createPatientStudyRef: CreatePatientStudyRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createPatientStudyRef:
```typescript
const name = createPatientStudyRef.operationName;
console.log(name);
```

### Variables
The `CreatePatientStudy` mutation requires an argument of type `CreatePatientStudyVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CreatePatientStudyVariables {
  clinicId: UUIDString;
  patientId: UUIDString;
  professionalId?: UUIDString | null;
  studyType: string;
  studyName: string;
  performedAt: TimestampString;
  resultSummary?: string | null;
  resultText?: string | null;
  metadata: unknown;
}
```
### Return Type
Recall that executing the `CreatePatientStudy` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreatePatientStudyData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreatePatientStudyData {
  patient_update?: Patient_Key | null;
  patientStudy_insert: PatientStudy_Key;
}
```
### Using `CreatePatientStudy`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createPatientStudy, CreatePatientStudyVariables } from '@historias/dataconnect';

// The `CreatePatientStudy` mutation requires an argument of type `CreatePatientStudyVariables`:
const createPatientStudyVars: CreatePatientStudyVariables = {
  clinicId: ...,
  patientId: ...,
  professionalId: ..., // optional
  studyType: ...,
  studyName: ...,
  performedAt: ...,
  resultSummary: ..., // optional
  resultText: ..., // optional
  metadata: ...,
};

// Call the `createPatientStudy()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createPatientStudy(createPatientStudyVars);
// Variables can be defined inline as well.
const { data } = await createPatientStudy({ clinicId: ..., patientId: ..., professionalId: ..., studyType: ..., studyName: ..., performedAt: ..., resultSummary: ..., resultText: ..., metadata: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createPatientStudy(dataConnect, createPatientStudyVars);

console.log(data.patient_update);
console.log(data.patientStudy_insert);

// Or, you can use the `Promise` API.
createPatientStudy(createPatientStudyVars).then((response) => {
  const data = response.data;
  console.log(data.patient_update);
  console.log(data.patientStudy_insert);
});
```

### Using `CreatePatientStudy`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createPatientStudyRef, CreatePatientStudyVariables } from '@historias/dataconnect';

// The `CreatePatientStudy` mutation requires an argument of type `CreatePatientStudyVariables`:
const createPatientStudyVars: CreatePatientStudyVariables = {
  clinicId: ...,
  patientId: ...,
  professionalId: ..., // optional
  studyType: ...,
  studyName: ...,
  performedAt: ...,
  resultSummary: ..., // optional
  resultText: ..., // optional
  metadata: ...,
};

// Call the `createPatientStudyRef()` function to get a reference to the mutation.
const ref = createPatientStudyRef(createPatientStudyVars);
// Variables can be defined inline as well.
const ref = createPatientStudyRef({ clinicId: ..., patientId: ..., professionalId: ..., studyType: ..., studyName: ..., performedAt: ..., resultSummary: ..., resultText: ..., metadata: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createPatientStudyRef(dataConnect, createPatientStudyVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.patient_update);
console.log(data.patientStudy_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.patient_update);
  console.log(data.patientStudy_insert);
});
```

