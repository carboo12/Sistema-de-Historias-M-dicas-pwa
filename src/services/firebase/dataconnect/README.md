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
  - [*GetPatient*](#getpatient)
  - [*ListAgenda*](#listagenda)
  - [*ListConsultations*](#listconsultations)
  - [*GetConsultation*](#getconsultation)
  - [*SearchCie10*](#searchcie10)
  - [*GetCatalogs*](#getcatalogs)
- [**Mutations**](#mutations)
  - [*LinkCurrentUser*](#linkcurrentuser)
  - [*CreatePatient*](#createpatient)
  - [*UpdatePatient*](#updatepatient)
  - [*CreateAppointment*](#createappointment)
  - [*UpdateAppointmentStatus*](#updateappointmentstatus)
  - [*CreateConsultation*](#createconsultation)
  - [*UpdateConsultation*](#updateconsultation)
  - [*SignConsultation*](#signconsultation)
  - [*AddDiagnosis*](#adddiagnosis)
  - [*DeleteDiagnosis*](#deletediagnosis)

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
    documentType: string;
    documentNumber?: string | null;
    documentVerified: boolean;
    fullName: string;
    firstName?: string | null;
    lastName?: string | null;
    birthDate?: DateString | null;
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
    documentType: string;
    documentNumber?: string | null;
    documentVerified: boolean;
    fullName: string;
    firstName?: string | null;
    lastName?: string | null;
    birthDate?: DateString | null;
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
      consultationDiagnoses_on_consultation: ({
        id: UUIDString;
        cie10Code?: string | null;
        diagnosisText: string;
        diagnosisType: string;
      } & ConsultationDiagnosis_Key)[];
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
    consultationDiagnoses_on_consultation: ({
      id: UUIDString;
      cie10Code?: string | null;
      diagnosisText: string;
      diagnosisType: string;
    } & ConsultationDiagnosis_Key)[];
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
      recordNumber: string;
      birthDate?: DateString | null;
      sex: string;
      allergiesNotes?: string | null;
    };
    professional: {
      fullName: string;
    };
    consultationDiagnoses_on_consultation: ({
      id: UUIDString;
      cie10Code?: string | null;
      diagnosisText: string;
      diagnosisType: string;
      notes?: string | null;
      diagnosedAt: TimestampString;
    } & ConsultationDiagnosis_Key)[];
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

## SearchCie10
You can execute the `SearchCie10` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
searchCie10(vars: SearchCie10Variables, options?: ExecuteQueryOptions): QueryPromise<SearchCie10Data, SearchCie10Variables>;

interface SearchCie10Ref {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: SearchCie10Variables): QueryRef<SearchCie10Data, SearchCie10Variables>;
}
export const searchCie10Ref: SearchCie10Ref;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
searchCie10(dc: DataConnect, vars: SearchCie10Variables, options?: ExecuteQueryOptions): QueryPromise<SearchCie10Data, SearchCie10Variables>;

interface SearchCie10Ref {
  ...
  (dc: DataConnect, vars: SearchCie10Variables): QueryRef<SearchCie10Data, SearchCie10Variables>;
}
export const searchCie10Ref: SearchCie10Ref;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the searchCie10Ref:
```typescript
const name = searchCie10Ref.operationName;
console.log(name);
```

### Variables
The `SearchCie10` query requires an argument of type `SearchCie10Variables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface SearchCie10Variables {
  q: string;
}
```
### Return Type
Recall that executing the `SearchCie10` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `SearchCie10Data`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface SearchCie10Data {
  cie10Codes: ({
    code: string;
    description: string;
    chapter?: string | null;
    category?: string | null;
  } & Cie10Code_Key)[];
}
```
### Using `SearchCie10`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, searchCie10, SearchCie10Variables } from '@historias/dataconnect';

// The `SearchCie10` query requires an argument of type `SearchCie10Variables`:
const searchCie10Vars: SearchCie10Variables = {
  q: ..., 
};

// Call the `searchCie10()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await searchCie10(searchCie10Vars);
// Variables can be defined inline as well.
const { data } = await searchCie10({ q: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await searchCie10(dataConnect, searchCie10Vars);

console.log(data.cie10Codes);

// Or, you can use the `Promise` API.
searchCie10(searchCie10Vars).then((response) => {
  const data = response.data;
  console.log(data.cie10Codes);
});
```

### Using `SearchCie10`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, searchCie10Ref, SearchCie10Variables } from '@historias/dataconnect';

// The `SearchCie10` query requires an argument of type `SearchCie10Variables`:
const searchCie10Vars: SearchCie10Variables = {
  q: ..., 
};

// Call the `searchCie10Ref()` function to get a reference to the query.
const ref = searchCie10Ref(searchCie10Vars);
// Variables can be defined inline as well.
const ref = searchCie10Ref({ q: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = searchCie10Ref(dataConnect, searchCie10Vars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.cie10Codes);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.cie10Codes);
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
  recordNumber: string;
  documentType: string;
  documentNumber?: string | null;
  documentVerified: boolean;
  fullName: string;
  firstName?: string | null;
  lastName?: string | null;
  birthDate?: DateString | null;
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
  recordNumber: ..., 
  documentType: ..., 
  documentNumber: ..., // optional
  documentVerified: ..., 
  fullName: ..., 
  firstName: ..., // optional
  lastName: ..., // optional
  birthDate: ..., // optional
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
const { data } = await createPatient({ clinicId: ..., recordNumber: ..., documentType: ..., documentNumber: ..., documentVerified: ..., fullName: ..., firstName: ..., lastName: ..., birthDate: ..., birthDateEstimated: ..., sex: ..., maritalStatus: ..., bloodType: ..., nationality: ..., birthPlace: ..., address: ..., city: ..., state: ..., country: ..., phone: ..., mobile: ..., email: ..., occupation: ..., isPrivate: ..., allergiesNotes: ..., currentDiagnosisSummary: ..., notes: ..., isSuspended: ..., suspensionReason: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createPatient(dataConnect, createPatientVars);

console.log(data.patient_insert);

// Or, you can use the `Promise` API.
createPatient(createPatientVars).then((response) => {
  const data = response.data;
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
  recordNumber: ..., 
  documentType: ..., 
  documentNumber: ..., // optional
  documentVerified: ..., 
  fullName: ..., 
  firstName: ..., // optional
  lastName: ..., // optional
  birthDate: ..., // optional
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
const ref = createPatientRef({ clinicId: ..., recordNumber: ..., documentType: ..., documentNumber: ..., documentVerified: ..., fullName: ..., firstName: ..., lastName: ..., birthDate: ..., birthDateEstimated: ..., sex: ..., maritalStatus: ..., bloodType: ..., nationality: ..., birthPlace: ..., address: ..., city: ..., state: ..., country: ..., phone: ..., mobile: ..., email: ..., occupation: ..., isPrivate: ..., allergiesNotes: ..., currentDiagnosisSummary: ..., notes: ..., isSuspended: ..., suspensionReason: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createPatientRef(dataConnect, createPatientVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.patient_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
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
  documentType: string;
  documentNumber?: string | null;
  documentVerified: boolean;
  fullName: string;
  firstName?: string | null;
  lastName?: string | null;
  birthDate?: DateString | null;
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
  documentType: ..., 
  documentNumber: ..., // optional
  documentVerified: ..., 
  fullName: ..., 
  firstName: ..., // optional
  lastName: ..., // optional
  birthDate: ..., // optional
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
const { data } = await updatePatient({ id: ..., documentType: ..., documentNumber: ..., documentVerified: ..., fullName: ..., firstName: ..., lastName: ..., birthDate: ..., birthDateEstimated: ..., sex: ..., maritalStatus: ..., bloodType: ..., nationality: ..., birthPlace: ..., address: ..., city: ..., state: ..., country: ..., phone: ..., mobile: ..., email: ..., occupation: ..., isPrivate: ..., allergiesNotes: ..., currentDiagnosisSummary: ..., notes: ..., isSuspended: ..., suspensionReason: ..., });

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
  documentType: ..., 
  documentNumber: ..., // optional
  documentVerified: ..., 
  fullName: ..., 
  firstName: ..., // optional
  lastName: ..., // optional
  birthDate: ..., // optional
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
const ref = updatePatientRef({ id: ..., documentType: ..., documentNumber: ..., documentVerified: ..., fullName: ..., firstName: ..., lastName: ..., birthDate: ..., birthDateEstimated: ..., sex: ..., maritalStatus: ..., bloodType: ..., nationality: ..., birthPlace: ..., address: ..., city: ..., state: ..., country: ..., phone: ..., mobile: ..., email: ..., occupation: ..., isPrivate: ..., allergiesNotes: ..., currentDiagnosisSummary: ..., notes: ..., isSuspended: ..., suspensionReason: ..., });

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
const { data } = await createAppointment({ clinicId: ..., patientId: ..., professionalId: ..., specialtyId: ..., officeId: ..., startsAt: ..., endsAt: ..., durationMinutes: ..., reason: ..., notes: ..., status: ..., source: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createAppointment(dataConnect, createAppointmentVars);

console.log(data.appointment_insert);

// Or, you can use the `Promise` API.
createAppointment(createAppointmentVars).then((response) => {
  const data = response.data;
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
const ref = createAppointmentRef({ clinicId: ..., patientId: ..., professionalId: ..., specialtyId: ..., officeId: ..., startsAt: ..., endsAt: ..., durationMinutes: ..., reason: ..., notes: ..., status: ..., source: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createAppointmentRef(dataConnect, createAppointmentVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.appointment_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
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
const { data } = await createConsultation({ clinicId: ..., patientId: ..., professionalId: ..., appointmentId: ..., specialtyId: ..., consultationType: ..., consultedAt: ..., reason: ..., notes: ..., status: ..., source: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createConsultation(dataConnect, createConsultationVars);

console.log(data.consultation_insert);

// Or, you can use the `Promise` API.
createConsultation(createConsultationVars).then((response) => {
  const data = response.data;
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
const ref = createConsultationRef({ clinicId: ..., patientId: ..., professionalId: ..., appointmentId: ..., specialtyId: ..., consultationType: ..., consultedAt: ..., reason: ..., notes: ..., status: ..., source: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createConsultationRef(dataConnect, createConsultationVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.consultation_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
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
const { data } = await updateConsultation({ id: ..., nextVisitAt: ..., reason: ..., currentIllness: ..., physicalExam: ..., functionalExam: ..., studies: ..., diagnosisNotes: ..., treatmentPlan: ..., evolution: ..., plan: ..., notes: ..., vitals: ..., });

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
const ref = updateConsultationRef({ id: ..., nextVisitAt: ..., reason: ..., currentIllness: ..., physicalExam: ..., functionalExam: ..., studies: ..., diagnosisNotes: ..., treatmentPlan: ..., evolution: ..., plan: ..., notes: ..., vitals: ..., });

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
}
```
### Return Type
Recall that executing the `SignConsultation` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `SignConsultationData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface SignConsultationData {
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
};

// Call the `signConsultation()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await signConsultation(signConsultationVars);
// Variables can be defined inline as well.
const { data } = await signConsultation({ id: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await signConsultation(dataConnect, signConsultationVars);

console.log(data.consultation_update);

// Or, you can use the `Promise` API.
signConsultation(signConsultationVars).then((response) => {
  const data = response.data;
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
};

// Call the `signConsultationRef()` function to get a reference to the mutation.
const ref = signConsultationRef(signConsultationVars);
// Variables can be defined inline as well.
const ref = signConsultationRef({ id: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = signConsultationRef(dataConnect, signConsultationVars);

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

## AddDiagnosis
You can execute the `AddDiagnosis` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
addDiagnosis(vars: AddDiagnosisVariables): MutationPromise<AddDiagnosisData, AddDiagnosisVariables>;

interface AddDiagnosisRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: AddDiagnosisVariables): MutationRef<AddDiagnosisData, AddDiagnosisVariables>;
}
export const addDiagnosisRef: AddDiagnosisRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
addDiagnosis(dc: DataConnect, vars: AddDiagnosisVariables): MutationPromise<AddDiagnosisData, AddDiagnosisVariables>;

interface AddDiagnosisRef {
  ...
  (dc: DataConnect, vars: AddDiagnosisVariables): MutationRef<AddDiagnosisData, AddDiagnosisVariables>;
}
export const addDiagnosisRef: AddDiagnosisRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the addDiagnosisRef:
```typescript
const name = addDiagnosisRef.operationName;
console.log(name);
```

### Variables
The `AddDiagnosis` mutation requires an argument of type `AddDiagnosisVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface AddDiagnosisVariables {
  clinicId: UUIDString;
  patientId: UUIDString;
  consultationId: UUIDString;
  professionalId?: UUIDString | null;
  cie10Code?: string | null;
  diagnosisText: string;
  diagnosisType: string;
  notes?: string | null;
}
```
### Return Type
Recall that executing the `AddDiagnosis` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `AddDiagnosisData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface AddDiagnosisData {
  consultationDiagnosis_insert: ConsultationDiagnosis_Key;
}
```
### Using `AddDiagnosis`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, addDiagnosis, AddDiagnosisVariables } from '@historias/dataconnect';

// The `AddDiagnosis` mutation requires an argument of type `AddDiagnosisVariables`:
const addDiagnosisVars: AddDiagnosisVariables = {
  clinicId: ..., 
  patientId: ..., 
  consultationId: ..., 
  professionalId: ..., // optional
  cie10Code: ..., // optional
  diagnosisText: ..., 
  diagnosisType: ..., 
  notes: ..., // optional
};

// Call the `addDiagnosis()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await addDiagnosis(addDiagnosisVars);
// Variables can be defined inline as well.
const { data } = await addDiagnosis({ clinicId: ..., patientId: ..., consultationId: ..., professionalId: ..., cie10Code: ..., diagnosisText: ..., diagnosisType: ..., notes: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await addDiagnosis(dataConnect, addDiagnosisVars);

console.log(data.consultationDiagnosis_insert);

// Or, you can use the `Promise` API.
addDiagnosis(addDiagnosisVars).then((response) => {
  const data = response.data;
  console.log(data.consultationDiagnosis_insert);
});
```

### Using `AddDiagnosis`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, addDiagnosisRef, AddDiagnosisVariables } from '@historias/dataconnect';

// The `AddDiagnosis` mutation requires an argument of type `AddDiagnosisVariables`:
const addDiagnosisVars: AddDiagnosisVariables = {
  clinicId: ..., 
  patientId: ..., 
  consultationId: ..., 
  professionalId: ..., // optional
  cie10Code: ..., // optional
  diagnosisText: ..., 
  diagnosisType: ..., 
  notes: ..., // optional
};

// Call the `addDiagnosisRef()` function to get a reference to the mutation.
const ref = addDiagnosisRef(addDiagnosisVars);
// Variables can be defined inline as well.
const ref = addDiagnosisRef({ clinicId: ..., patientId: ..., consultationId: ..., professionalId: ..., cie10Code: ..., diagnosisText: ..., diagnosisType: ..., notes: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = addDiagnosisRef(dataConnect, addDiagnosisVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.consultationDiagnosis_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.consultationDiagnosis_insert);
});
```

## DeleteDiagnosis
You can execute the `DeleteDiagnosis` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
deleteDiagnosis(vars: DeleteDiagnosisVariables): MutationPromise<DeleteDiagnosisData, DeleteDiagnosisVariables>;

interface DeleteDiagnosisRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeleteDiagnosisVariables): MutationRef<DeleteDiagnosisData, DeleteDiagnosisVariables>;
}
export const deleteDiagnosisRef: DeleteDiagnosisRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
deleteDiagnosis(dc: DataConnect, vars: DeleteDiagnosisVariables): MutationPromise<DeleteDiagnosisData, DeleteDiagnosisVariables>;

interface DeleteDiagnosisRef {
  ...
  (dc: DataConnect, vars: DeleteDiagnosisVariables): MutationRef<DeleteDiagnosisData, DeleteDiagnosisVariables>;
}
export const deleteDiagnosisRef: DeleteDiagnosisRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the deleteDiagnosisRef:
```typescript
const name = deleteDiagnosisRef.operationName;
console.log(name);
```

### Variables
The `DeleteDiagnosis` mutation requires an argument of type `DeleteDiagnosisVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface DeleteDiagnosisVariables {
  id: UUIDString;
}
```
### Return Type
Recall that executing the `DeleteDiagnosis` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `DeleteDiagnosisData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface DeleteDiagnosisData {
  consultationDiagnosis_delete?: ConsultationDiagnosis_Key | null;
}
```
### Using `DeleteDiagnosis`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, deleteDiagnosis, DeleteDiagnosisVariables } from '@historias/dataconnect';

// The `DeleteDiagnosis` mutation requires an argument of type `DeleteDiagnosisVariables`:
const deleteDiagnosisVars: DeleteDiagnosisVariables = {
  id: ..., 
};

// Call the `deleteDiagnosis()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await deleteDiagnosis(deleteDiagnosisVars);
// Variables can be defined inline as well.
const { data } = await deleteDiagnosis({ id: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await deleteDiagnosis(dataConnect, deleteDiagnosisVars);

console.log(data.consultationDiagnosis_delete);

// Or, you can use the `Promise` API.
deleteDiagnosis(deleteDiagnosisVars).then((response) => {
  const data = response.data;
  console.log(data.consultationDiagnosis_delete);
});
```

### Using `DeleteDiagnosis`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, deleteDiagnosisRef, DeleteDiagnosisVariables } from '@historias/dataconnect';

// The `DeleteDiagnosis` mutation requires an argument of type `DeleteDiagnosisVariables`:
const deleteDiagnosisVars: DeleteDiagnosisVariables = {
  id: ..., 
};

// Call the `deleteDiagnosisRef()` function to get a reference to the mutation.
const ref = deleteDiagnosisRef(deleteDiagnosisVars);
// Variables can be defined inline as well.
const ref = deleteDiagnosisRef({ id: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = deleteDiagnosisRef(dataConnect, deleteDiagnosisVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.consultationDiagnosis_delete);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.consultationDiagnosis_delete);
});
```

