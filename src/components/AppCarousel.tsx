import Carousel, {ICarouselInstance, Pagination} from 'react-native-reanimated-carousel';
import { Dimensions, View } from 'react-native'; 

type CarouselData<T> = {
    data: T[]
};
const width = Dimensions.get("window").width;

export default function AppCarousel<T>({ data }: Readonly<CarouselData<T>>) {
    return (
        <View>
            <Carousel data={data} renderItem={({item}) => (<></>)} width={width} height={width / 2}/>
        </View>
    );
}