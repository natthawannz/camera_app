import { StyleSheet, Text, View, Image, TouchableOpacity, FlatList, Dimensions } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useEffect, useRef, useState } from "react";
import * as MediaLibrary from "expo-media-library";
import { Ionicons } from "@expo/vector-icons";

const { width, height } = Dimensions.get("window");

export default function App() {
  const [cameraPermission] = useCameraPermissions();
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [photos, setPhotos] = useState<string[]>([]);
  const [facing, setFacing] = useState<"back" | "front">("back");
  const [torch, setTorch] = useState(false);
  const [galleryMode, setGalleryMode] = useState(false);
  const [startIndex, setStartIndex] = useState(0);

  const cameraRef = useRef<CameraView | null>(null);

  useEffect(() => {
    MediaLibrary.requestPermissionsAsync();
  }, []);

  //ถ่ายรูป
  const handleTakePicture = async () => {
    if (cameraRef.current) {
      try {
        const newPhoto = await cameraRef.current.takePictureAsync({ quality: 1 });
        setCapturedPhoto(newPhoto.uri);
      } catch (err) {
        console.error(err);
      }
    }
  };

  // บันทึกลงอัลบั้ม + เก็บใน state
  const handleSaveToGallery = async () => {
    if (capturedPhoto) {
      try {
        const asset = await MediaLibrary.createAssetAsync(capturedPhoto);
        setPhotos((prev) => [asset.uri, ...prev]);
        setCapturedPhoto(null);
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Preview Mode
  if (capturedPhoto) {
    return (
      <View style={styles.container}>
        <Image source={{ uri: capturedPhoto }} style={styles.previewImage} />
        <View style={styles.previewActions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.retakeButton]}
            onPress={() => setCapturedPhoto(null)}
          >
            <Ionicons name="refresh-outline" size={26} color="#fff" />
            <Text style={styles.actionText}>Retake</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.saveButton]}
            onPress={handleSaveToGallery}
          >
            <Ionicons name="save-outline" size={26} color="#fff" />
            <Text style={styles.actionText}>Save</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Gallery Mode
  if (galleryMode) {
    return (
      <View style={styles.container}>
        <FlatList
          data={photos}
          keyExtractor={(item, index) => index.toString()}
          horizontal
          pagingEnabled
          initialScrollIndex={startIndex}
          getItemLayout={(_, index) => ({
            length: width,
            offset: width * index,
            index,
          })}
          renderItem={({ item }) => (
            <Image source={{ uri: item }} style={{ width, height, resizeMode: "contain", backgroundColor: "black" }} />
          )}
        />
        {/* ปุ่มปิด Gallery */}
        <TouchableOpacity
          style={styles.closeGallery}
          onPress={() => setGalleryMode(false)}
        >
          <Ionicons name="close" size={32} color="white" />
        </TouchableOpacity>
      </View>
    );
  }

  // Camera Mode
  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing={facing}
        enableTorch={torch}
      />

      {/* ปุ่มด้านบน */}
      <View style={styles.topControls}>
        <TouchableOpacity onPress={() => setTorch(!torch)}>
          <Ionicons
            name={torch ? "flash" : "flash-off"}
            size={28}
            color="white"
          />
        </TouchableOpacity>
      </View>

      {/* ปุ่มด้านล่าง */}
      <View style={styles.bottomControls}>
        {/* Thumbnail ล่าสุด → เปิด Gallery */}
        {photos.length > 0 ? (
          <TouchableOpacity
            onPress={() => {
              setStartIndex(0);
              setGalleryMode(true);
            }}
          >
            <Image source={{ uri: photos[0] }} style={styles.thumbnail} />
          </TouchableOpacity>
        ) : (
          <View style={styles.thumbnailPlaceholder} />
        )}

        <TouchableOpacity style={styles.captureButton} onPress={handleTakePicture}>
          <View style={styles.innerCircle} />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setFacing(facing === "back" ? "front" : "back")}>
          <Ionicons name="camera-reverse" size={30} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  camera: { flex: 1, width: "100%" },

  topControls: {
    position: "absolute",
    top: 50,
    width: "100%",
    flexDirection: "row",
    justifyContent: "flex-start",
    paddingHorizontal: 25,
  },

  bottomControls: {
    position: "absolute",
    bottom: 30,
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 40,
  },

  captureButton: {
    width: 85,
    height: 85,
    borderRadius: 42.5,
    borderWidth: 4,
    borderColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  innerCircle: {
    width: 65,
    height: 65,
    borderRadius: 32.5,
    backgroundColor: "#eee",
  },

  thumbnail: {
    width: 45,
    height: 45,
    borderRadius: 8,
  },
  thumbnailPlaceholder: {
    width: 45,
    height: 45,
    borderRadius: 8,
    backgroundColor: "#333",
  },

  previewImage: { flex: 1, width: "100%", resizeMode: "cover" },
  previewActions: {
    position: "absolute",
    bottom: 40,
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-around",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 40,
    gap: 8,
  },
  retakeButton: { backgroundColor: "#E63946" },
  saveButton: { backgroundColor: "#2ECC71" },
  actionText: { color: "#fff", fontSize: 15, fontWeight: "600" },

  closeGallery: {
    position: "absolute",
    top: 40,
    right: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 8,
    borderRadius: 20,
  },
});
