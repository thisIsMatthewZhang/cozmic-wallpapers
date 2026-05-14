import Carousel, { ICarouselInstance, Pagination } from 'react-native-reanimated-carousel';
import { Dimensions, View, Image, ImageSourcePropType } from 'react-native'; 
import { useRef } from 'react';
import { useSharedValue } from 'react-native-reanimated';

type CarouselData = {
    data: ImageSourcePropType[]
};
const width = Dimensions.get("window").width;

export default function AppCarousel({ data }: Readonly<CarouselData>) {
    const ref = useRef<ICarouselInstance | null>(null);
    const progress = useSharedValue<number>(0);

    const onPressPagination = (index: number) => {
        ref.current?.scrollTo({
            /**
             * Calculate the difference between the current index and the target index
             * to ensure that the carousel scrolls to the nearest index
             */
            count: index - progress.value,
            animated: true,
        });
    };


    return (
        <View style={{ flex: 1 }}>
            <Carousel 
                data={data} 
                renderItem={({item}) => (
                <View style={{ flex: 1, borderWidth: 1, justifyContent: 'center' }}>
                    <Image source={item} width={100} height={100}/>
                </View>
            )} 
                width={width}
                height={width / 2}
            />
            <Pagination.Basic 
                progress={progress} 
                data={data}
                dotStyle={{ backgroundColor: "rgba(0,0,0,0.2)", borderRadius: 50 }}
                containerStyle={{ gap: 5, marginTop: 10 }}
                onPress={onPressPagination}
            />
        </View>
    );
}