# Data Flow in the 2sxc Edit UI

This should help keep an overview of how data flows and is changed through the system.
Note that it's a bit complex, because we have all these parts which kind of store state:

## State "Stores"

1. The Reactive Angular **Form**, which is a virtual form
    1. This is the "master" of current data, in the current language
1. The **UI controls**, which are shown to the user and usually linked to the **Form**
1. The EavItem in the **ItemService**
    1. it contains the data loaded from the backend
    1. it contains all values in all languages
1. Form State
1. Form Settings
1. Field State and Settings

## State Changes

The following systems/places can change the state

1. loading the data from the server
1. the user changing the data in the UI
1. formulas modifying the data
1. Unsure: something writing data directly to the ItemService...

## Data Flow WIP

1. Loading places the data in the
    1. EavItem in the ItemService
    1. Reactive Angular Form
1. User changes in the UI
    1. change the Reactive Angular Form
    1. change the UI controls
1. Formulas
    ...
1. Saving
1. Language Change
