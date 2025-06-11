import SwiftUI

struct PreviewView: View {
    var body: some View {
        VStack {
            Text("아이폰 화면 미리보기")
                .font(.title)
                .padding()
            Image(systemName: "iphone")
                .resizable()
                .aspectRatio(contentMode: .fit)
                .frame(width: 150, height: 300)
                .foregroundColor(.blue)
            Text("여기에 미리보기 내용을 추가하세요.")
                .padding()
        }
    }
}

#Preview {
    PreviewView()
}
