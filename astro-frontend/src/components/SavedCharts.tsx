// frontend/src/components/SavedCharts.tsx (new file for viewing saved charts)
import React from "react";
import { useAuth } from "./AuthProvider";
import { getFirestore, collection, query, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Box, Heading, VStack, Text, Accordion, AccordionItem, AccordionButton, AccordionPanel, AccordionIcon } from "@chakra-ui/react";
import ChartDisplay from "./ChartDisplay";

interface SavedChart {
  id: string;
  birthData: any;
  houseSystem: string;
  chart: any;
  createdAt: string;
}

const SavedCharts: React.FC = () => {
  const { user } = useAuth();
  const [charts, setCharts] = useState<SavedChart[]>([]);
  const [loading, setLoading] = useState(true);
  const db = getFirestore();

  useEffect(() => {
    if (user) {
      const fetchCharts = async () => {
        const q = query(collection(db, `users/${user.uid}/charts`));
        const querySnapshot = await getDocs(q);
        const saved = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as SavedChart));
        setCharts(saved);
        setLoading(false);
      };
      fetchCharts();
    }
  }, [user]);

  if (loading) return <Text>Loading...</Text>;
  if (!charts.length) return <Text>No saved charts.</Text>;

  return (
    <Box>
      <Heading>Saved Charts</Heading>
      <Accordion allowMultiple>
        {charts.map((saved) => (
          <AccordionItem key={saved.id}>
            <AccordionButton>
              <Box flex="1" textAlign="left">
                Chart from {new Date(saved.createdAt).toLocaleString()}
              </Box>
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel>
              <VStack spacing={4}>
                <Text>Birth Date: {saved.birthData.date} {saved.birthData.time}</Text>
                <Text>Location: Lat {saved.birthData.latitude}, Lon {saved.birthData.longitude}, TZ {saved.birthData.timezone}</Text>
                <Text>House System: {saved.houseSystem}</Text>
                <ChartDisplay chart={saved.chart} />
              </VStack>
            </AccordionPanel>
          </AccordionItem>
        ))}
      </Accordion>
    </Box>
  );
};

export default SavedCharts;