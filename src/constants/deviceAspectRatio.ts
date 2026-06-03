import { Dimensions } from "react-native";

const VALID_ASPECT_RATIOS = ["9:16" , "16:9" , "3:4" , "4:3" , "2:3" , "3:2" , "1:1"] as const;
const { width, height } = Dimensions.get("screen");
const deviceRatio = width / height;

const ratioToDecimal = (ratio: string) => {
    const [w, h] = ratio.split(':').map(Number);
    return w / h;
};

export const CLOSEST_ASPECT_RATIO = VALID_ASPECT_RATIOS.reduce((prevRatio, currRatio) => {
    const closestDistance = Math.abs(deviceRatio - ratioToDecimal(prevRatio));
    const currentDistance = Math.abs(deviceRatio - ratioToDecimal(currRatio));

    return currentDistance < closestDistance ? currRatio : prevRatio;
});