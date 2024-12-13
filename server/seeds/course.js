const { fakerEN: faker } = require('@faker-js/faker')
const Course = require('../models/course')
const User = require('../models/user')
const CategoryCourse = require('../models/category_course')
const generateUserId = async () => {
  const roles = await User.findAll()
  const userIds = roles.map(role => role.id)
  const randomIndex = Math.floor(Math.random() * userIds.length)
  const randomUserId = userIds[randomIndex]
  return randomUserId
}

const generateCategoryCourseId = async () => {
  const roles = await CategoryCourse.findAll()
  const categoryCourseIds = roles.map(role => role.id)
  const randomIndex = Math.floor(Math.random() * categoryCourseIds.length)
  const randomCategoryId = categoryCourseIds[randomIndex]
  return randomCategoryId
}

const sampleNames = [
  'Kiến thức nhập môn IT',
  'Cơ bản phát triển web',
  'App - Ứng dụng di động',
  'Những kiến thức thiết yếu về Học máy',
  'JavaScript cho Người mới bắt đầu',
  'Khóa học Python Nhanh',
  'Nguyên tắc Thiết kế UX/UI',
  'Xây dựng website với Reactjs',
  'Lập trình C++ cơ bản',
  'Lập trình Python All',
  'Thuật toán Nâng cao',
  'Cấu trúc Dữ liệu',
  'Phát triển Ứng dụng Di động',
  'Cơ bản Điện toán Đám mây',
  'Trí tuệ Nhân tạo'
]
const sampleDescriptions = [
  'Khám phá thế giới khoa học dữ liệu với khóa học giới thiệu này. Học các khái niệm và kỹ thuật cơ bản được sử dụng để rút ra những hiểu biết từ dữ liệu. Khám phá trực quan hóa dữ liệu, phân tích thống kê và những kiến thức cơ bản về máy học. Trải nghiệm thực tế với các công cụ phổ biến như Python và R. Hiểu quy trình làm việc khoa học dữ liệu từ thu thập dữ liệu đến đánh giá mô hình. Làm việc trên các dự án thực tế để áp dụng kiến thức của bạn. Khám phá cách khoa học dữ liệu được sử dụng trong các ngành công nghiệp khác nhau. Nâng cao kỹ năng giải quyết vấn đề và phân tích của bạn. Không cần kinh nghiệm trước, hoàn hảo cho người mới bắt đầu. Bắt đầu hành trình trở thành nhà khoa học dữ liệu ngay hôm nay. Bạn cũng sẽ học về làm sạch dữ liệu, kỹ thuật tính năng và tầm quan trọng của đạo đức dữ liệu. Khóa học này bao gồm các bài giảng từ các chuyên gia trong ngành. Bạn sẽ được truy cập vào một cộng đồng trực tuyến hỗ trợ và các tài nguyên bổ sung. Vào cuối khóa, bạn sẽ sẵn sàng cho các nghiên cứu khoa học dữ liệu nâng cao hơn.',
  'Khám phá bí quyết thành công trong tiếp thị kỹ thuật số với khóa học toàn diện này. Hiểu được các nguyên tắc cốt lõi của chiến lược tiếp thị trực tuyến. Học cách tạo các chiến dịch truyền thông xã hội hiệu quả và tối ưu hóa trang web của bạn cho các công cụ tìm kiếm. Đi sâu vào các kỹ thuật tiếp thị qua email và tiếp thị nội dung. Khám phá vai trò của phân tích trong việc đo lường thành công chiến dịch. Trải nghiệm thực tế với các công cụ tiếp thị kỹ thuật số phổ biến. Nghiên cứu các trường hợp thành công trong chiến lược tiếp thị kỹ thuật số. Phát triển hiểu biết vững chắc về SEO, SEM và quảng cáo PPC. Khóa học này lý tưởng cho những người tiếp thị kỹ thuật số tương lai và chủ doanh nghiệp nhỏ. Nắm vững các kỹ năng cần thiết để phát triển trong thế giới kỹ thuật số. Bạn cũng sẽ khám phá tầm quan trọng của tiếp thị di động và trải nghiệm người dùng. Nhận những hiểu biết về các xu hướng và công nghệ mới nhất trong tiếp thị kỹ thuật số. Tham gia vào các hội thảo tương tác và các dự án nhóm. Vào cuối khóa, bạn sẽ sẵn sàng để tạo và triển khai các chiến lược tiếp thị kỹ thuật số của riêng bạn.',
  'Bắt đầu hành trình học Python, một trong những ngôn ngữ lập trình phổ biến nhất. Bắt đầu với các kiến thức cơ bản về cú pháp, biến và kiểu dữ liệu. Tiến tới các khái niệm phức tạp hơn như vòng lặp, hàm và xử lý lỗi. Thực hành thông qua các bài tập lập trình và dự án. Hiểu cách làm việc với các thư viện và module. Khám phá ứng dụng của Python trong phát triển web, phân tích dữ liệu và tự động hóa. Xây dựng nền tảng vững chắc về logic lập trình và giải quyết vấn đề. Khóa học này phù hợp cho người mới bắt đầu không có kinh nghiệm lập trình trước. Vào cuối khóa, bạn sẽ có khả năng viết mã Python hiệu quả và hiệu quả. Khởi đầu sự nghiệp lập trình của bạn với Python. Bạn cũng sẽ học về lập trình hướng đối tượng và xử lý tệp. Tham gia vào các đánh giá mã của bạn cùng đồng nghiệp và các buổi gỡ lỗi. Truy cập vào một kho tài nguyên bổ sung và các thử thách lập trình. Khóa học này chuẩn bị cho bạn các kỹ năng lập trình Python nâng cao và các lĩnh vực chuyên biệt.',
  'Khám phá thế giới thiết kế đồ họa với khóa học thân thiện cho người mới bắt đầu này. Học các nguyên tắc cơ bản của thiết kế, bao gồm lý thuyết màu sắc, kiểu chữ và bố cục. Làm quen với các phần mềm tiêu chuẩn trong ngành như Adobe Photoshop và Illustrator. Phát triển kỹ năng của bạn thông qua các dự án và bài tập thực hành. Khám phá quy trình tạo logo, brochure và minh họa kỹ thuật số. Hiểu tầm quan trọng của thương hiệu và nhận diện thị giác. Nghiên cứu tác phẩm của các nhà thiết kế nổi tiếng để lấy cảm hứng. Khóa học này lý tưởng cho những người thiết kế tương lai và các chuyên gia sáng tạo. Không cần kinh nghiệm thiết kế trước. Giải phóng sự sáng tạo và bắt đầu thiết kế nội dung hấp dẫn về mặt hình ảnh. Bạn cũng sẽ học về các nguyên tắc thiết kế trải nghiệm người dùng (UX) và giao diện người dùng (UI). Tham gia vào các buổi phê bình và nhận phản hồi cá nhân về công việc của bạn. Nhận những hiểu biết về các xu hướng và công nghệ thiết kế mới nhất. Vào cuối khóa, bạn sẽ có một portfolio mạnh mẽ để trưng bày kỹ năng của mình.',
  'Nắm vững kiến thức cơ bản về kế toán tài chính với khóa học nền tảng này. Học các khái niệm và nguyên tắc chính của kế toán. Hiểu cách chuẩn bị và giải thích các báo cáo tài chính. Khám phá chu kỳ kế toán, từ các bút toán đến bảng cân đối thử. Nghiên cứu sự khác biệt giữa tài sản, nợ phải trả và vốn chủ sở hữu. Thực hành sử dụng phần mềm kế toán. Phân tích các tỷ số tài chính và ý nghĩa của chúng đối với quyết định kinh doanh. Khóa học này hoàn hảo cho bất kỳ ai muốn bắt đầu sự nghiệp trong kế toán hoặc tài chính. Vào cuối khóa, bạn sẽ có khả năng quản lý và báo cáo thông tin tài chính chính xác. Xây dựng khả năng hiểu biết tài chính và kỹ năng kế toán của bạn. Bạn cũng sẽ học về các kiểm soát nội bộ và thực tiễn kiểm toán. Tham gia vào các bài tập thực tế và nghiên cứu trường hợp để củng cố kiến thức. Truy cập vào các tài nguyên bổ sung và hỗ trợ từ các chuyên gia kế toán. Khóa học này chuẩn bị cho bạn các nghiên cứu kế toán nâng cao và các chứng chỉ chuyên nghiệp.',
  'Vượt qua nỗi sợ nói trước đám đông với khóa học hấp dẫn này. Học các kỹ thuật thiết yếu để thuyết trình hiệu quả và truyền đạt thông điệp của bạn. Hiểu tầm quan trọng của ngôn ngữ cơ thể và sự đa dạng trong giọng nói. Phát triển kỹ năng tổ chức suy nghĩ và trình bày chúng một cách rõ ràng. Thực hành nói trước khán giả thông qua các bài tập tương tác. Nhận phản hồi mang tính xây dựng để cải thiện hiệu suất của bạn. Nghiên cứu các bài phát biểu nổi tiếng để xác định những gì làm cho chúng trở nên mạnh mẽ. Khóa học này lý tưởng cho học sinh, chuyên gia và bất kỳ ai muốn cải thiện khả năng nói trước công chúng. Tăng sự tự tin và sự rõ ràng trong giao tiếp của bạn. Biến bạn thành một người nói thuyết phục và hấp dẫn. Bạn cũng sẽ học về việc sử dụng trợ giúp trực quan và kỹ thuật kể chuyện. Tham gia vào các bài đánh giá đồng nghiệp và các buổi thuyết trình nhóm. Nhận những hiểu biết về cách xử lý các phiên hỏi đáp và đối phó với lo lắng khi nói trước công chúng. Vào cuối khóa, bạn sẽ có bộ công cụ chiến lược để xuất sắc trong bất kỳ tình huống nói chuyện nào.',
  'Thành thạo các nguyên tắc cơ bản của quản lý dự án với khóa học thiết yếu này. Hiểu được vòng đời dự án từ khởi đầu đến kết thúc. Học các phương pháp chủ chốt như Agile, Scrum và Waterfall. Phát triển kỹ năng lập kế hoạch, lập lịch và phân bổ nguồn lực. Khám phá các kỹ thuật quản lý rủi ro và đảm bảo chất lượng. Trải nghiệm thực tế với các công cụ quản lý dự án như MS Project và Trello. Nghiên cứu các trường hợp thực tế để hiểu các ứng dụng trong thế giới thực. Khóa học này phù hợp cho những người quản lý dự án tương lai và các chuyên gia trong bất kỳ lĩnh vực nào. Vào cuối khóa, bạn sẽ có khả năng lãnh đạo các dự án thành công và đạt được kết quả. Nâng cao kỹ năng tổ chức và lãnh đạo của bạn. Bạn cũng sẽ học về quản lý các bên liên quan và chiến lược giao tiếp. Tham gia vào các mô phỏng và dự án nhóm để áp dụng kiến thức của bạn. Truy cập vào các tài nguyên bổ sung và được hướng dẫn bởi các nhà quản lý dự án giàu kinh nghiệm. Khóa học này chuẩn bị cho bạn các chứng chỉ quản lý dự án và các nghiên cứu nâng cao.',
  'Khám phá lĩnh vực thú vị của máy học trong khóa học giới thiệu này. Học các khái niệm và thuật toán cốt lõi được sử dụng trong máy học. Hiểu các kỹ thuật học có giám sát và không giám sát. Trải nghiệm thực tế với các thư viện máy học phổ biến như TensorFlow và scikit-learn. Làm việc trên các dự án thực tế để áp dụng kiến thức của bạn. Nghiên cứu các vấn đề đạo đức và thách thức trong máy học. Phát triển kỹ năng tiền xử lý dữ liệu, huấn luyện mô hình và đánh giá. Khóa học này được thiết kế cho người mới bắt đầu với kiến thức lập trình cơ bản. Vào cuối khóa, bạn sẽ có khả năng xây dựng và triển khai các mô hình máy học. Bắt đầu hành trình của bạn vào thế giới AI và máy học. Bạn cũng sẽ học về mạng nơ-ron và học sâu. Tham gia vào các cuộc hackathon và cuộc thi lập trình. Truy cập vào các tài nguyên bổ sung và các hướng dẫn cho các chủ đề nâng cao. Khóa học này chuẩn bị cho bạn các nghiên cứu chuyên biệt về máy học và AI.',
  'Khám phá nghiên cứu về môi trường với khóa học giới thiệu này. Học về các khái niệm và nguyên tắc chính của khoa học môi trường. Khám phá các chủ đề như hệ sinh thái, đa dạng sinh học và biến đổi khí hậu. Hiểu tác động của con người đối với tài nguyên thiên nhiên và môi trường. Nghiên cứu vai trò của các chính sách và quy định trong bảo vệ môi trường. Tham gia vào công việc thực địa và các thí nghiệm phòng thí nghiệm. Phân tích các nghiên cứu trường hợp của các vấn đề và giải pháp môi trường. Khóa học này phù hợp cho bất kỳ ai quan tâm đến bền vững môi trường. Nắm bắt hiểu biết toàn diện về các thách thức và cơ hội môi trường. Bước đầu tiên hướng tới sự nghiệp trong khoa học môi trường. Bạn cũng sẽ học về năng lượng tái tạo và các chiến lược bảo tồn. Tham gia vào các dự án cộng đồng và hoạt động vận động bảo vệ môi trường. Truy cập vào các tài nguyên bổ sung và sự hỗ trợ từ các chuyên gia môi trường. Khóa học này chuẩn bị cho bạn các nghiên cứu khoa học môi trường nâng cao và các sự nghiệp.',
  'Hiểu được các nguyên tắc cơ bản của kinh tế học với khóa học dành cho người mới bắt đầu này. Học về cầu và cung, cấu trúc thị trường và các chỉ số kinh tế. Khám phá các khái niệm về kinh tế vi mô và kinh tế vĩ mô. Nghiên cứu vai trò của chính phủ và chính sách tiền tệ trong nền kinh tế. Hiểu cách các lý thuyết kinh tế áp dụng vào các tình huống thực tế. Phân tích tác động của toàn cầu hóa đối với nền kinh tế. Khóa học này lý tưởng cho học sinh và chuyên gia mong muốn có hiểu biết cơ bản về kinh tế. Không cần kiến thức trước. Phát triển kỹ năng phân tích và tư duy phản biện trong các bối cảnh kinh tế. Bắt đầu hành trình trở thành người có hiểu biết kinh tế. Bạn cũng sẽ học về phát triển kinh tế và thương mại quốc tế. Tham gia vào các cuộc thảo luận và tranh luận về các vấn đề kinh tế hiện tại. Truy cập vào các tài nguyên bổ sung và tài liệu để đào sâu hiểu biết của bạn. Khóa học này chuẩn bị cho bạn các nghiên cứu nâng cao về kinh tế và ứng dụng.'
]
const sampleSummaies = [
  'Khóa học này cung cấp một giới thiệu toàn diện về các khái niệm và thực hành lập trình dành cho người mới bắt đầu. Các chủ đề bao gồm biến, kiểu dữ liệu, cấu trúc điều khiển, hàm và nhiều hơn nữa.',
  'Học những kiến thức cơ bản về phát triển web bao gồm HTML, CSS và JavaScript. Khóa học này bao gồm các khái niệm thiết yếu để xây dựng các trang web tĩnh và tương tác.',
  'Khám phá các nền tảng của khoa học dữ liệu và phân tích với các bộ dữ liệu thực tế. Học cách làm sạch, thao tác và trực quan hóa dữ liệu, cũng như các kỹ thuật phân tích thống kê cơ bản.',
  'Khám phá các khái niệm và kỹ thuật thiết yếu của các thuật toán máy học. Khóa học này bao gồm học có giám sát và không giám sát, phân loại, hồi quy, phân cụm và nhiều hơn nữa.',
  'Một khóa học giới thiệu về ngôn ngữ lập trình JavaScript. Các chủ đề bao gồm cú pháp, kiểu dữ liệu, hàm, mảng, đối tượng và thao tác DOM.',
  'Khóa học dạy nhanh về ngôn ngữ lập trình Python dành cho người mới bắt đầu. Học cú pháp cơ bản, cấu trúc dữ liệu, luồng điều khiển, hàm và nhiều hơn nữa. Phù hợp cho những người mới bắt đầu lập trình.',
  'Học các nguyên tắc và kỹ thuật thiết kế trải nghiệm người dùng (UX) và giao diện người dùng (UI). Các chủ đề bao gồm nguyên tắc khả dụng, tạo khung dây, tạo nguyên mẫu và kiểm thử người dùng.',
  'Bắt đầu với những kiến thức cơ bản về các chiến lược và công cụ tiếp thị kỹ thuật số. Học về SEO, SEM, tiếp thị truyền thông xã hội, tiếp thị email và phân tích.',
  'Giới thiệu về các phương pháp luận quản lý dự án và các thực tiễn tốt nhất. Khóa học này bao gồm lập kế hoạch dự án, lập lịch, ngân sách, quản lý rủi ro và giao tiếp với các bên liên quan.'
]
const samplePrepareA = [
  'Bạn không cần biết gì hơn nữa, trong khóa học tôi sẽ chỉ cho bạn những gì bạn cần phải biết. Tuy duy mở để dễ dàng tiếp nhận các tư tưởng mới được chia sẻ trong các bài học. Máy vi tính kết nối internet. Ý thức cao, trách nhiệm cao trong việc tự học. Thực hành lại sau mỗi bài học.'
]

const sampleImage = ['https://res.cloudinary.com/dessdbtlz/image/upload/v1729434656/elearning/gko8dircln5xfgnrcvyz.webp',
  'https://res.cloudinary.com/dessdbtlz/image/upload/v1729434666/elearning/qct0gm4h1zlvf59cbigv.webp',
  'https://res.cloudinary.com/dessdbtlz/image/upload/v1729434677/elearning/rqubgwek1f5w46ghqoaf.webp',
  'https://res.cloudinary.com/dessdbtlz/image/upload/v1729434688/elearning/w4wzfydnnd7kv7hkc9jo.webp',
  'https://res.cloudinary.com/dessdbtlz/image/upload/v1729434700/elearning/sximwcpzwwusfnpjnntn.webp',
  'https://res.cloudinary.com/dessdbtlz/image/upload/v1729434707/elearning/zep4kfzwhtriiir1wd9x.webp',
  'https://res.cloudinary.com/dessdbtlz/image/upload/v1729434716/elearning/pp3ytywct1oe2wqnuzqs.webp',
  'https://res.cloudinary.com/dessdbtlz/image/upload/v1729434724/elearning/vk96hrwozt3gicbe6ivo.webp',
  'https://res.cloudinary.com/dessdbtlz/image/upload/v1729434731/elearning/jhunoxxwu7eeykornvlk.webp',
  'https://res.cloudinary.com/dessdbtlz/image/upload/v1729434741/elearning/twzhzhrdvuxvluvvwgvw.webp',
  'https://res.cloudinary.com/dessdbtlz/image/upload/v1729434748/elearning/qzxvsnhxlzfapygq7fw4.webp',
  'https://res.cloudinary.com/dessdbtlz/image/upload/v1729434756/elearning/ggdaosrhorsojzogaysc.webp',
  'https://res.cloudinary.com/dessdbtlz/image/upload/v1729434763/elearning/yuvucx8i8d93ps1zgybh.webp',
  'https://res.cloudinary.com/dessdbtlz/image/upload/v1729434771/elearning/vvrntafntpaf2o6bnjvb.webp',
  'https://res.cloudinary.com/dessdbtlz/image/upload/v1729434777/elearning/obcby39cjwf4mn6ky751.webp'
]
const samplevideolocationPath = 'https://res.cloudinary.com/dessdbtlz/video/upload/v1729437635/elearning/lrbylpgz09jld7jutzdw.mp4'
const startDate = new Date()
startDate.setDate(startDate.getDate() - 2)

const generateCourses = async () => {
  const courses = []

  for (let i = 0; i < sampleNames.length; i++) {
    const name = sampleNames[i]
    const summary = sampleSummaies[i]
    const description = sampleDescriptions[i]
    const randomImage = sampleImage[Math.floor(Math.random() * sampleImage.length)]
    const prepare = samplePrepareA[Math.floor(Math.random() * samplePrepareA.length)]
    const price = 10000
    courses.push({
      categoryCourseId: await generateCategoryCourseId(),
      name,
      summary,
      description,
      assignedBy: await generateUserId(),
      durationInMinute: faker.number.int({ min: 30, max: 120 }),
      status: 2,
      startDate,
      endDate: null,
      createAt: faker.date.past(),
      updatedAt: faker.date.recent(),
      // locationPath: 'course/course' + (i + 1) + '.png',
      locationPath: randomImage,
      videoLocationPath: samplevideolocationPath,
      prepare,
      price
    })
  }
  return courses
}

const seedCourses = async () => {
  try {
    const count = await Course.count()
    if (count === 0) {
      const courses = await generateCourses()
      await Course.bulkCreate(courses, { validate: true })
    } else {
      console.log('Courses table is not empty.')
    }
  } catch (error) {
    console.log(`Failed to seed Courses data: ${error}`)
  }
}

module.exports = seedCourses
