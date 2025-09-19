import React from "react";
import { Page } from "@shopify/polaris";
import CollectionTree from "../components/CollectionTree";

export default function HomePage() {
    return (
        <Page title="Collection Tree">
            <CollectionTree />
        </Page>
    );
}
