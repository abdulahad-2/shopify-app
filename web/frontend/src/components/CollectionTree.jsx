import React, { useEffect, useState } from 'react';
import { Card, TextStyle, Button, Collapsible, Stack } from '@shopify/polaris';

function Node({ node }) {
    const [open, setOpen] = useState(true);
    return (
        <div style={{ marginLeft: 12, marginTop: 6 }}>
            <Stack alignment="center" distribution="equalSpacing">
                <Stack.Item>
                    <Button plain onClick={() => setOpen(!open)}>
                        {node.children && node.children.length ? (open ? '▾ ' : '▸ ') : '• '}
                        <TextStyle variation="strong">{node.title}</TextStyle>
                    </Button>
                </Stack.Item>
                <Stack.Item>
                    <TextStyle>{node.handle}</TextStyle>
                </Stack.Item>
            </Stack>
            {node.children && node.children.length > 0 && (
                <Collapsible open={open}>
                    <div style={{ paddingLeft: 8 }}>
                        {node.children.map(child => <Node node={child} key={child.id} />)}
                    </div>
                </Collapsible>
            )}
        </div>
    )
}

export default function CollectionTree() {
    const [tree, setTree] = useState([]);
    useEffect(() => {
        fetch('/api/collections-tree')
            .then(r => r.json())
            .then(data => setTree(data.tree || []))
            .catch(err => console.error(err));
    }, []);
    return (
        <Card title="Collection tree" sectioned>
            {tree.length === 0 && <div>No collections found.</div>}
            {tree.map(node => <Node node={node} key={node.id} />)}
        </Card>
    )
}
