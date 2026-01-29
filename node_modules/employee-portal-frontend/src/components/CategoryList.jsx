import React from 'react';
import { Box, List, ListItem, Text } from '@chakra-ui/react';

const CategoryList = ({ categories = [] }) => {
  if (!categories.length) {
    return (
      <Box mt={4}>
        <Text color="gray.500">No categories found.</Text>
      </Box>
    );
  }

  return (
    <Box mt={4}>
      <List spacing={2}>
        {categories.map((category) => (
          <ListItem key={category._id || category.id}>
            <Text fontWeight="medium">{category.name || 'Untitled Category'}</Text>
            {category.description ? (
              <Text fontSize="sm" color="gray.500">
                {category.description}
              </Text>
            ) : null}
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default CategoryList;
